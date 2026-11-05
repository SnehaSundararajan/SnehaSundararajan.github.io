/* Work layouts v3 and v4: work pages in the Gouache style (staging iteration 04's look).
   Five divergent ways to show the work, all sharing the same paper, muted
   earth palette, brush-wobbled shapes, and readable DM Sans labels.
   - Painted index   a list; hovering a row paints a brush stroke behind it
   - Desk spread     painted project cards you can toss; the circle shows pencil notes
   - Paint chips     tall paint-store swatches that lift and widen on hover
   - Sketchbook      one project per spread, with painted tabs to jump between
   - Sticker sheet   die-cut project stickers on a backing sheet that peel on hover
   Round two (after keeping Painted index and Paint chips):
   - Fan deck        a paint fan deck that opens on hover; the picked strip shows its story
   - Painted bento   a calm bento of painted blocks sized by importance
   - Brush timeline  years across the top, one brush stroke per project
   - Swatch rows     the index with a swatch per row; one row opens into a wide chip
   - Catalog         a paint catalog: projects grouped by discipline, small named chips
   Round three:
   - Index + reader  the Painted index with real case studies; picking one turns the list
                     into a left sidebar and reads the article in the main panel
   Every page opens the same quick view on click, restyled in gouache. */

window.Gouache = (function () {
  // A different painted silhouette per project, so the set never looks like a grid of boxes.
  const SHAPES = [
    '46% 54% 52% 48% / 52% 44% 56% 48%', // pebble
    '50% 50% 10px 10px / 42% 42% 10px 10px', // arch
    '50%', // circle
    '18px', // tile
    '8px 60% 8px 60%', // leaf
    '62% 38% 46% 54% / 60% 52% 48% 40%', // blob
  ];
  const shape = i => SHAPES[i % SHAPES.length];
  const tone = p => `--h:${p.hue}`;

  const FILTERS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <filter id="gw-brush"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="9" result="t"/><feDisplacementMap data-wobble="shape" data-base="5" in="SourceGraphic" in2="t" scale="5"/></filter>
    <filter id="gw-text"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="11" result="t"/><feDisplacementMap data-wobble="text" data-base="3" in="SourceGraphic" in2="t" scale="1"/></filter>
  </svg>`;

  /**
   * Shared setup: gouache scope on the concept root (so the quick view picks it up),
   * the brush filters, and live Desk style sliders (wobble, text wobble, weight).
   */
  function frame(root, sc, cls, html) {
    root.classList.add('gw-root');
    sc.add(() => root.classList.remove('gw-root'));
    root.innerHTML = `<div class="gw ${cls}">${html}${FILTERS}</div>`;
    const box = root.querySelector('.gw');
    const wobble = () => {
      const { wobble: w, textWobble: t } = Lab.state.deskStyle;
      box.querySelectorAll('feDisplacementMap[data-wobble]').forEach(f => {
        f.setAttribute('scale', (Number(f.dataset.base) * (f.dataset.wobble === 'text' ? t : w) * 2).toFixed(2));
      });
    };
    wobble();
    sc.add(Lab.subscribe((st, changed) => { if (changed.includes('deskStyle')) wobble(); }));
    Work.bind(root, sc);
    return box;
  }

  const head = (title, sub) => `<header class="gw-head"><h2 class="gw-title">${title}</h2><p>${sub}</p></header>`;
  const paint = (p, i, extra = '') => `<span class="gw-paint ${extra}" style="${tone(p)}; --shape:${shape(i)}" aria-hidden="true"><span>${p.glyph}</span></span>`;

  return { shape, tone, frame, head, paint };
})();

(function () {
  const SNAPSHOT = {
    preset: 'custom', intensity: 0.16, speed: 1, easing: 'linear',
    types: { entrance: false, ambient: true, cursor: false, hover: true, text: false, customCursor: false },
    accentHue: 239, texture: false,
  };
  // Registered under Work layouts; js/versions.js groups them into v3 and v4.
  const R = (id, title, oneLiner, inspiration, readability, mount, extra = {}) => Lab.register('work', {
    id, title, oneLiner, levers: ['hover'], deskControls: true, snapshot: SNAPSHOT,
    inspiration, readability, mount, ...extra,
  });
  const projects = () => Lab.PROJECTS.slice(0, 8);

  /* ---------- 1. Painted index ---------- */
  R('gw-index', 'Painted index',
    'A plain project list in big readable type. Hovering a row paints a gouache brush stroke behind it in that project\'s color, with a small painted shape at the start.',
    [{ name: 'Studio index pages', url: 'https://www.awwwards.com/websites/portfolio/', borrow: 'one project per line' },
     { name: 'Highlighter on paper', url: 'https://en.wikipedia.org/wiki/Highlighter', borrow: 'color as a reading aid, not decoration' }],
    ['The fastest page to scan: number, title, type, year', 'Color only appears where you are looking'],
    (root, { scope: sc }) => {
      Gouache.frame(root, sc, 'gw-index', `
        ${Gouache.head('Work', 'Selected projects, newest first.')}
        <ol class="gwi-list">${projects().map((p, i) => `
          <li><button class="gwi-row" data-pid="${p.id}" style="${Gouache.tone(p)}">
            <span class="gwi-stroke" aria-hidden="true"></span>
            ${Gouache.paint(p, i, 'is-dot')}
            <span class="gwi-num">${String(i + 1).padStart(2, '0')}</span>
            <b class="gwi-title">${Lab.esc(p.title)}</b>
            <span class="gwi-type">${Lab.esc(p.type)}</span>
            <span class="gwi-year">${p.year}</span>
          </button></li>`).join('')}</ol>`);
    });

  /* ---------- 2. Desk spread ---------- */
  R('gw-desk', 'Desk spread',
    'Projects as painted cards laid out on the desk. Drag and toss them like the stickers; Tidy up squares them back. The circle shows the pencil notes underneath: role and impact.',
    [{ name: 'Iteration 04', url: '#', borrow: 'toss, tidy, and the reveal circle' },
     { name: 'Mood boards', url: 'https://en.wikipedia.org/wiki/Mood_board', borrow: 'work spread out on a table' }],
    ['Cards start tidy in reading order', 'Notes under the circle are a bonus; the card names the project', 'Click a card to open it'],
    (root, { scope: sc, motion }) => {
      const narrow = root.clientWidth < 700;
      const ps = projects().slice(0, narrow ? 6 : 8);
      const card = (p, i, under) => `
        <div class="gwd-card${under ? ' is-under' : ''}" ${under ? '' : `data-pid="${p.id}" role="button" tabindex="0"`} style="${Gouache.tone(p)}">
          <div class="gwd-face">
            ${under ? `<span class="gwd-sketch" style="--shape:${Gouache.shape(i)}"></span>` : Gouache.paint(p, i)}
            <b>${Lab.esc(p.title)}</b>
            <small>${Lab.esc(p.type)} · ${p.year}</small>
            ${under ? `<em class="gwd-note">${Lab.esc(p.role)}, ${Lab.esc(p.impact)}</em>` : ''}
          </div>
        </div>`;
      const box = Gouache.frame(root, sc, 'gw-desk', `
        ${Gouache.head('Work', 'Pick one up. Tidy up puts them back.')}
        <div class="gwd-top">${ps.map((p, i) => card(p, i, false)).join('')}</div>
        <div class="gwd-under" aria-hidden="true">${ps.map((p, i) => card(p, i, true)).join('')}</div>
        <div class="gwd-ring" aria-hidden="true"></div>
        <button class="it1-tidy gwd-tidy">Tidy up</button>`);
      const W = box.clientWidth, H = box.clientHeight;
      // Size the cards so every row fits below the heading.
      const cols = narrow ? 2 : 4, rows = Math.ceil(ps.length / cols), topY = narrow ? 150 : 160;
      const ch = Math.min((narrow ? (W - 48) / 2 : Math.min(230, (W - 120) / 4)) * 1.12, (H - topY - 24 - (rows - 1) * 18) / rows), cw = ch / 1.12;
      const left = (W - cols * cw - (cols - 1) * 18) / 2;
      const els = [...box.querySelectorAll('.gwd-top .gwd-card')];
      const twins = [...box.querySelectorAll('.gwd-under .gwd-card')];
      const items = els.map((el, i) => {
        const c = i % cols, r = Math.floor(i / cols);
        const x = left + c * (cw + 18) + Math.sin(i * 7.1) * 10, y = topY + r * (ch + 18) + Math.cos(i * 5.3) * 8;
        [el, twins[i]].forEach(n => { n.style.width = `${cw}px`; n.style.height = `${ch}px`; n.firstElementChild.style.rotate = `${Math.sin(i * 3.7) * 3}deg`; });
        return { el, x, y, w: cw, h: ch };
      });
      const physics = Kit.tossable(sc, motion, box, items, { friction: 0.9, bounce: 0.5, edge: 0.2 });
      sc.on(box.querySelector('.gwd-tidy'), 'click', () => physics.home());
      sc.frame(() => items.forEach((it, i) => {
        twins[i].style.translate = it.el.style.translate;
        twins[i].firstElementChild.style.setProperty('--tilt', it.el.firstElementChild.style.getPropertyValue('--tilt') || '0deg');
      }));
      const under = box.querySelector('.gwd-under'), ring = box.querySelector('.gwd-ring');
      Staging.peek(sc, box, root, {
        R: narrow ? 64 : 80,
        start: { x: items[0].x + cw / 2, y: items[0].y + ch / 2 },
        paint: (x, y, r) => {
          under.style.clipPath = `circle(${r.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
          ring.style.cssText = `translate:${x - r}px ${y - r}px; width:${r * 2}px; height:${r * 2}px; opacity:${r > 2 ? 1 : 0}`;
        },
      });
    }, { ownsCursor: true });

  /* ---------- 3. Paint chips ---------- */
  R('gw-chips', 'Paint chips',
    'Each project is a tall paint-store swatch in its own muted color, name printed at the foot. Hover a chip and it lifts and widens to show the one-line story.',
    [{ name: 'Paint store swatch cards', url: 'https://en.wikipedia.org/wiki/Paint_chip', borrow: 'a named color per item' },
     { name: 'Pantone chips', url: 'https://www.pantone.com', borrow: 'the white label strip at the bottom' }],
    ['Names sit on a white strip, so they always read', 'Only one chip opens at a time', 'Stacks into rows on small screens'],
    (root, { scope: sc }) => {
      Gouache.frame(root, sc, 'gw-chips', `
        ${Gouache.head('Work', 'Every project has its own color.')}
        <div class="gwc-row">${projects().map((p, i) => `
          <button class="gwc-chip" data-pid="${p.id}" style="${Gouache.tone(p)}; --i:${i}">
            <span class="gwc-paint" aria-hidden="true"><span>${p.glyph}</span></span>
            <span class="gwc-label">
              <b>${Lab.esc(p.title)}</b>
              <small>${Lab.esc(p.type)} · ${p.year}</small>
              <span class="gwc-blurb">${Lab.esc(p.blurb)}</span>
            </span>
          </button>`).join('')}</div>`);
    });

  /* ---------- 4. Sketchbook ---------- */
  R('gw-book', 'Sketchbook',
    'One project per spread. The left page is a big painted study, the right page the story with pencil notes in the margin. Painted tabs on the edge jump between projects; arrow keys work too.',
    [{ name: 'Designers\' sketchbooks', url: 'https://en.wikipedia.org/wiki/Sketchbook', borrow: 'one idea per spread' },
     { name: 'Index tabs', url: 'https://en.wikipedia.org/wiki/Tab_(stationery)', borrow: 'color-coded jumps' }],
    ['One project at a time, so nothing competes', 'Tabs show every project at a glance', 'Arrow keys and tabs both navigate'],
    (root, { scope: sc, motion }) => {
      const ps = projects().slice(0, 6);
      const box = Gouache.frame(root, sc, 'gw-book', `
        <div class="gwb-book">
          <div class="gwb-spread" aria-live="polite"></div>
          <nav class="gwb-tabs" aria-label="Projects">${ps.map((p, i) => `<button class="gwb-tab" data-i="${i}" style="${Gouache.tone(p)}; --i:${i}" aria-label="${Lab.esc(p.title)}"><span>${String(i + 1).padStart(2, '0')}</span></button>`).join('')}</nav>
        </div>
        <div class="gwb-nav"><button data-step="-1" aria-label="Previous project">←</button><span class="gwb-count"></span><button data-step="1" aria-label="Next project">→</button></div>`);
      const spread = box.querySelector('.gwb-spread');
      let cur = 0;
      const show = (i, dir = 1) => {
        cur = (i + ps.length) % ps.length;
        const p = ps[cur];
        spread.innerHTML = `
          <div class="gwb-page gwb-left">${Gouache.paint(p, cur, 'is-study')}<span class="gwb-folio">${String(cur + 1).padStart(2, '0')}</span></div>
          <div class="gwb-page gwb-right">
            <p class="gwb-type">${Lab.esc(p.type)} · ${p.year}</p>
            <h2 class="gw-title">${Lab.esc(p.title)}</h2>
            <p class="gwb-blurb">${Lab.esc(p.blurb)}</p>
            <ul class="gwb-notes"><li><em>role</em> ${Lab.esc(p.role)}</li><li><em>impact</em> ${Lab.esc(p.impact)}</li><li><em>tags</em> ${p.tags.map(Lab.esc).join(', ')}</li></ul>
            <button class="gwb-open" data-pid="${p.id}">Open the project →</button>
          </div>`;
        if (motion().intensity > 0) spread.animate([{ opacity: 0, translate: `${dir * 16}px 0` }, { opacity: 1, translate: '0 0' }], { duration: 260, easing: 'ease-out' });
        box.querySelectorAll('.gwb-tab').forEach((t, k) => t.classList.toggle('is-on', k === cur));
        box.querySelector('.gwb-count').textContent = `${cur + 1} / ${ps.length}`;
      };
      show(0);
      sc.on(box, 'click', e => {
        const t = e.target.closest('.gwb-tab');
        if (t) return show(Number(t.dataset.i), Number(t.dataset.i) > cur ? 1 : -1);
        const s = e.target.closest('[data-step]');
        if (s) show(cur + Number(s.dataset.step), Number(s.dataset.step));
      });
      sc.on(document, 'keydown', e => {
        if (e.target.closest('input, textarea, select')) return;
        if (e.key === 'ArrowRight') show(cur + 1, 1);
        if (e.key === 'ArrowLeft') show(cur - 1, -1);
      });
    });

  /* ---------- 5. Sticker sheet ---------- */
  R('gw-sheet', 'Sticker sheet',
    'A sheet of die-cut gouache stickers, one per project, each a different shape with a kiss-cut line around it. Hover one and its corner peels up; click to open it.',
    [{ name: 'Sticker sheets', url: 'https://www.stickermule.com/products/sticker-sheets', borrow: 'kiss-cut shapes on a backing sheet' },
     { name: 'The sticker desk', url: '#', borrow: 'shapes as personality' }],
    ['Titles sit inside each sticker in the label font', 'Loose grid keeps reading order', 'Peel is small and only on hover'],
    (root, { scope: sc }) => {
      Gouache.frame(root, sc, 'gw-sheet', `
        ${Gouache.head('Work', 'Peel one off.')}
        <div class="gws-sheet">${projects().map((p, i) => `
          <button class="gws-sticker" data-pid="${p.id}" style="${Gouache.tone(p)}; --shape:${Gouache.shape(i)}; --r:${(Math.sin(i * 2.3) * 4).toFixed(1)}deg">
            <span class="gws-cut" aria-hidden="true"></span>
            <span class="gws-face"><b>${Lab.esc(p.title)}</b><small>${Lab.esc(p.type)} · ${p.year}</small></span>
          </button>`).join('')}</div>`);
    });

  /* ================= Round two ================= */


  /* ---------- 6. Fan deck ---------- */
  R('gw-fan', 'Fan deck',
    'All projects as one paint fan deck pinned at the corner. Hover the deck and it fans open; point at a strip and it slides out while its story appears beside the deck.',
    [{ name: 'Paint fan decks', url: 'https://en.wikipedia.org/wiki/Color_chart', borrow: 'a closed deck that fans open' },
     { name: 'Paint chips (kept)', url: '#', borrow: 'one color per project, name on a white strip' }],
    ['The detail panel always names the strip you are on', 'Fans open on small screens by default', 'Click a strip or the panel to open the project'],
    (root, { scope: sc }) => {
      const ps = projects();
      const n = ps.length;
      const box = Gouache.frame(root, sc, 'gw-fan', `
        ${Gouache.head('Work', 'Open the deck.')}
        <div class="gwf-wrap">
          <div class="gwf-deck">${ps.map((p, i) => `
            <button class="gwf-strip" data-pid="${p.id}" data-i="${i}" style="${Gouache.tone(p)}; --closed:${(i * 1.4 - 4).toFixed(1)}deg; --open:${(-62 + (i * 84) / (n - 1)).toFixed(1)}deg; z-index:${i + 1}">
              <span class="gwf-paint" aria-hidden="true"></span>
              <span class="gwf-label"><b>${Lab.esc(p.title)}</b><small>${p.year}</small></span>
            </button>`).join('')}
            <span class="gwf-pin" aria-hidden="true"></span>
          </div>
          <aside class="gwf-detail" aria-live="polite"></aside>
        </div>`);
      const detail = box.querySelector('.gwf-detail');
      const show = i => {
        const p = ps[i];
        box.querySelectorAll('.gwf-strip').forEach((s, k) => s.classList.toggle('is-on', k === i));
        detail.style.cssText = Gouache.tone(p);
        detail.innerHTML = `<span class="gwf-swatch" aria-hidden="true"></span>
          <p class="gwb-type">${Lab.esc(p.type)} · ${p.year}</p><h3 class="gwf-title">${Lab.esc(p.title)}</h3>
          <p>${Lab.esc(p.blurb)}</p><p class="gwf-meta">${Lab.esc(p.role)} · ${Lab.esc(p.impact)}</p>
          <button class="gwb-open" data-pid="${p.id}">Open the project →</button>`;
      };
      show(0);
      sc.on(box, 'pointerover', e => { const s = e.target.closest('.gwf-strip'); if (s) show(Number(s.dataset.i)); });
      sc.on(box, 'focusin', e => { const s = e.target.closest('.gwf-strip'); if (s) show(Number(s.dataset.i)); });
    });

  /* ---------- 7. Painted bento ---------- */
  R('gw-bento', 'Painted bento',
    'A quiet bento of painted blocks. Bigger projects get bigger blocks; each names its project in the corner. Hover a block and its paint deepens and the one-line story appears.',
    [{ name: 'Bento grids', url: 'https://bentogrids.com', borrow: 'size as importance' },
     { name: 'Mid-century color blocking', url: 'https://en.wikipedia.org/wiki/Color_field', borrow: 'flat fields of muted color' }],
    ['Titles are always visible, bottom left', 'Size follows importance, so the eye lands on the best work first', 'Collapses to two columns on small screens'],
    (root, { scope: sc }) => {
      Gouache.frame(root, sc, 'gw-bento', `
        ${Gouache.head('Work', 'Bigger blocks, bigger projects.')}
        <div class="gwg-grid">${projects().map((p, i) => `
          <button class="gwg-block is-w${p.weight}" data-pid="${p.id}" style="${Gouache.tone(p)}">
            <span class="gwg-glyph" aria-hidden="true">${p.glyph}</span>
            <span class="gwg-text"><small>${Lab.esc(p.type)} · ${p.year}</small><b>${Lab.esc(p.title)}</b><span class="gwg-blurb">${Lab.esc(p.blurb)}</span></span>
          </button>`).join('')}</div>`);
    });

  /* ---------- 8. Brush timeline ---------- */
  R('gw-time', 'Brush timeline',
    'Years run across the top in pencil. Each project is one gouache brush stroke on its own line, starting at its year, with its name painted on. Hover one and the rest step back.',
    [{ name: 'Gantt charts', url: 'https://en.wikipedia.org/wiki/Gantt_chart', borrow: 'one bar per item on a time axis' },
     { name: 'Painted index (kept)', url: '#', borrow: 'brush strokes as the highlight' }],
    ['Reads left to right in time, top to bottom by project', 'Names sit on the strokes, so no legend is needed', 'Stroke length is a placeholder for project length'],
    (root, { scope: sc }) => {
      const ps = projects().slice().sort((a, b) => a.year - b.year);
      const y0 = Math.min(...ps.map(p => p.year)), y1 = Math.max(...ps.map(p => p.year)) + 1;
      const span = y1 - y0;
      Gouache.frame(root, sc, 'gw-time', `
        ${Gouache.head('Work', `${y0} to ${y1 - 1}, one stroke per project.`)}
        <div class="gwt-chart" style="--cols:${span}">
          <div class="gwt-axis" aria-hidden="true">${Array.from({ length: span }, (_, k) => `<span>${y0 + k}</span>`).join('')}</div>
          ${ps.map((p, i) => {
            const start = p.year - y0, len = Math.min(span - start, Math.max(1, p.weight * 0.9));
            return `<button class="gwt-row" data-pid="${p.id}" style="${Gouache.tone(p)}; --start:${start}; --len:${len.toFixed(2)}; --i:${i}">
              <span class="gwt-stroke"><b>${Lab.esc(p.title)}</b><small>${Lab.esc(p.type)}</small></span>
            </button>`;
          }).join('')}
        </div>`);
    });

  /* ---------- 9. Swatch rows ---------- */
  R('gw-rows', 'Swatch rows',
    'The painted index and the paint chips combined: a list with a swatch on every row. One row is always open as a wide chip with the story, role, and impact; hover or tab to another to open it.',
    [{ name: 'Painted index (kept)', url: '#', borrow: 'one project per line' },
     { name: 'Paint chips (kept)', url: '#', borrow: 'the chip that widens to tell the story' }],
    ['Closed rows are as quick to scan as the index', 'Exactly one row is open, so the page never jumps around much', 'Keyboard: tab through rows'],
    (root, { scope: sc }) => {
      const ps = projects();
      const box = Gouache.frame(root, sc, 'gw-rows', `
        ${Gouache.head('Work', 'Point at a row to open it.')}
        <div class="gwr-list">${ps.map((p, i) => `
          <div class="gwr-row${i === 0 ? ' is-open' : ''}" style="${Gouache.tone(p)}" tabindex="0" data-i="${i}">
            <span class="gwr-swatch" aria-hidden="true"><span>${p.glyph}</span></span>
            <span class="gwr-head"><b>${Lab.esc(p.title)}</b><small>${Lab.esc(p.type)}</small><small class="gwr-year">${p.year}</small></span>
            <span class="gwr-body">
              <span class="gwr-blurb">${Lab.esc(p.blurb)}</span>
              <span class="gwr-meta"><em>role</em> ${Lab.esc(p.role)} <em>impact</em> ${Lab.esc(p.impact)}</span>
              <button class="gwb-open" data-pid="${p.id}">Open the project →</button>
            </span>
          </div>`).join('')}</div>`);
      const open = row => { if (!row || row.classList.contains('is-open')) return; box.querySelectorAll('.gwr-row').forEach(r => r.classList.toggle('is-open', r === row)); };
      sc.on(box, 'pointerover', e => { if (Lab.motion().types.hover) open(e.target.closest('.gwr-row')); });
      sc.on(box, 'focusin', e => open(e.target.closest('.gwr-row')));
      sc.on(box, 'click', e => open(e.target.closest('.gwr-row')));
    });

  /* ---------- 10. Catalog ---------- */
  R('gw-catalog', 'Catalog',
    'A paint manufacturer\'s catalog page: projects grouped into columns by discipline, each a small named color chip with its year. Dense, orderly, and easy to scan by kind of work.',
    [{ name: 'Paint catalogs', url: 'https://en.wikipedia.org/wiki/Color_chart', borrow: 'named chips grouped into families' },
     { name: 'Swiss grid', url: 'https://en.wikipedia.org/wiki/International_Typographic_Style', borrow: 'columns with small caps headings' }],
    ['Grouping answers "what kind of work" at a glance', 'Every chip names its project and year', 'Columns wrap on small screens'],
    (root, { scope: sc }) => {
      const groups = {};
      Lab.PROJECTS.forEach(p => { (groups[p.tags[0]] = groups[p.tags[0]] || []).push(p); });
      Gouache.frame(root, sc, 'gw-catalog', `
        ${Gouache.head('Work', 'The full catalog, by kind of work.')}
        <div class="gwk-cols">${Object.entries(groups).map(([tag, ps]) => `
          <section class="gwk-col"><h3>${Lab.esc(tag)} <span>${ps.length}</span></h3>
            ${ps.map(p => `<button class="gwk-chip" data-pid="${p.id}" style="${Gouache.tone(p)}"><span class="gwk-sw" aria-hidden="true"></span><b>${Lab.esc(p.title)}</b><small>${Lab.esc(p.type)} · ${p.year}</small></button>`).join('')}
          </section>`).join('')}</div>`);
    });

  /* ================= Round three: real case studies ================= */

  // Per-article edits, matched on the Medium URL: a shorter display title and the research
  // methods used (read from each article's sections). PANW entries are placeholders.
  // [url match, kind, methods, display title, short sidebar title]
  const CURATION = [
    ['mri-scans', 'Medical tech', ['Secondary research', 'Market research', 'User needs analysis', 'User journey mapping'], 'Acclimatization for MRI Scans using VR Technology', 'MRI Acclimatization'],
    ['hands-free-mouse', 'Assistive tech', ['Usability testing'], null, 'Hands-free Mouse'],
    ['crowdfunding', 'Quantitative analysis', ['User journey mapping', 'WCAG audit', 'Literature review', 'User survey', 'Google Analytics', 'Affinity mapping', 'Storyboarding', 'A/B testing plan'], null, 'Crowdfunding For Mobile'],
    ['travel-safe', 'Research', ['Accident data analysis', 'Competitive analysis', 'Behaviour models (Fogg)', 'Feasibility check', 'A/B testing'], null, 'Travel Safe'],
    ['ava-your-online-waitress', 'UX design', ['Secondary research', 'Survey', 'User interviews', 'Emotion mapping', 'Personas', 'Storyboarding', 'Usability testing', 'Benchmark testing'], 'Ava: Your Online Waitress', 'Ava'],
    ['nudge', 'Product design', ['Secondary research', 'Competitive analysis', 'Affinity mapping', 'User interviews', 'Usability testing'], 'Nudge, the Lifestyle App', 'Nudge'],
  ];
  // Articles left out of the site even though they are on Medium (matched on the URL).
  const HIDDEN = ['edvora', 'moving-to-mars'];
  // PANW case studies: titles set, content to come.
  const PLACEHOLDERS = [['panw-1', 'Next-Gen Trust Security'], ['panw-2', 'Secure Workload Access']]
    .map(([key, t]) => ({ key, title: t, short: t, kind: 'Palo Alto Networks', methods: [], locked: true }));

  /* Password protection. Locked case studies ship encrypted (js/data/protected.js, made by
     tools/protect.mjs); the password decrypts them in the browser and is remembered for the session. */
  const unlocked = {};
  // A small line-drawn padlock, in the text color, shown beside locked titles until they are unlocked.
  const LOCK = '<svg class="gwx-lockmark" viewBox="0 0 16 16" role="img" aria-label="Password protected"><rect x="3.25" y="7" width="9.5" height="6.75" rx="1.6"/><path d="M5.5 7V5.25a2.5 2.5 0 0 1 5 0V7"/></svg>';
  const lockFor = cs => cs.locked && !unlocked[cs.key] ? LOCK : '';
  const PW_KEY = 'hugo-lab:case-pass';
  async function decrypt(key, password) {
    const blob = Lab.PROTECTED?.[key];
    if (!blob || !crypto.subtle) return null;
    const bytes = b => Uint8Array.from(atob(b), c => c.charCodeAt(0));
    try {
      const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
      const k = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: bytes(blob.salt), iterations: blob.iterations, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(blob.iv) }, k, bytes(blob.data)));
    } catch { return null; }
  }
  // The case study order (matched on key or URL).
  const DEFAULT_ORDER = ['panw-1', 'panw-2', 'hands-free-mouse', 'crowdfunding', 'nudge', 'mri-scans', 'travel-safe', 'ava-your-online-waitress'];
  const defaultRank = cs => { const i = DEFAULT_ORDER.findIndex(k => cs.key.includes(k)); return i < 0 ? DEFAULT_ORDER.length : i; };
  function caseStudies() {
    const arts = (Lab.ARTICLES || []).filter(a => !HIDDEN.some(k => a.url.includes(k))).map(a => {
      const [, kind = 'Case study', methods = [], title, short] = CURATION.find(([k]) => a.url.includes(k)) || [];
      // Articles published in Bootcamp (Design Bootcamp) live under medium.com/design-bootcamp/.
      const bootcamp = a.url.includes('/design-bootcamp/');
      return { ...a, key: a.url, title: title || a.title, short: short || title || a.title, kind, methods, bootcamp };
    });
    return [...PLACEHOLDERS, ...arts].sort((a, b) => defaultRank(a) - defaultRank(b));
  }
  // The list always follows DEFAULT_ORDER (see caseStudies()).
  const ordered = list => list;
  const HUES = [35, 150, 215, 300, 75, 20, 260, 120, 190, 340];
  // Reader options. Navigation is locked to Top strip (your pick); the other modes stay in the
  // code so switching back is a one-line change. Color dots on the index rows stay switchable.
  const readerNav = 'strip';
  let readerDots = 'hide';
  // Modes readerNav can take: sidebar, back (button), close (×), strip.

  // The reader, with an optional methodology section (variant): 'none', 'top', 'tab', 'entry', 'side'.
  // opts.start: which view a methodology layout opens on ('method' for side-by-side comparison, 'cases' for the site).
  // opts.stack: one scrolling page instead of two views: Philosophy first, the case studies underneath;
  // the two nav links scroll to their section and follow the scroll.
  const readerMount = (variant, opts = {}) => (root, { scope: sc, motion, content }) => {
      // The website supplies its own philosophy images (content.images.philosophy, in order).
      philosophyImgs = content?.images?.philosophy || [];
      const withEntry = variant === 'entry';
      const all = () => withEntry ? [METHOD_ENTRY, ...ordered(caseStudies())] : ordered(caseStudies());
      let list = all();
      const hueOf = cs => cs.key === METHOD_ENTRY.key ? 48 : HUES[caseStudies().findIndex(x => x.key === cs.key) % HUES.length];
      const stack = !!opts.stack;
      const navLinks = stack
        ? '<button data-view="method" aria-current="true">Philosophy</button><button data-view="cases" aria-current="false">Case studies</button>'
        : '<button data-view="cases" aria-current="false">Case studies</button><button data-view="method" aria-current="true">Philosophy</button>';
      const box = Gouache.frame(root, sc, `gw-reader${stack ? ' is-stacked' : ''}`, `
        <div class="gwx-index">
          <div class="gwx-top">
            ${HOME}
            ${variant === 'tab' ? '<div class="gwx-tabs" role="tablist"><button role="tab" aria-selected="true" data-view="cases">Case studies</button><button role="tab" aria-selected="false" data-view="method">Philosophy</button></div>' : ''}
            ${NAV_VARIANTS.includes(variant) ? '<nav class="gwx-nav" aria-label="Work sections">' + navLinks + '</nav>' : ''}
          </div>
          ${variant === 'top' ? `<section class="gwx-method is-row" aria-label="Philosophy">${methodPanels()}</section>` : ''}
        </div>
        ${variant === 'tab' ? `<section class="gwx-method is-big" aria-label="Philosophy" hidden>${methodPanels()}</section>` : ''}
        ${NAV_VARIANTS.includes(variant) ? (stack ? '<h2 class="gwx-sec">Philosophy</h2>' : '') + METHOD_VIEWS[variant]() : ''}
        ${stack ? '<h2 class="gwx-sec gwx-sec-cases">Case studies</h2>' : ''}
        <div class="gwx-shell${variant === 'side' ? ' has-side' : ''}">
          <nav class="gwx-list" aria-label="Case studies">
            <div class="gwx-side-top">
              <button class="gwx-back" data-back>← All work</button>
              <button class="gwx-fold" data-fold aria-expanded="true" title="Collapse the list"><span aria-hidden="true">«</span><span class="sr">Collapse the list</span></button>
            </div>
            <ol></ol>
          </nav>
          ${variant === 'side' ? `<aside class="gwx-method is-col" aria-label="Philosophy">${methodPanels()}</aside>` : ''}
          <article class="gwx-main" aria-live="polite" tabindex="-1"></article>
        </div>
        <div class="gwx-methods" aria-hidden="true"></div>`);
      const ol = box.querySelector('.gwx-list ol');
      const main = box.querySelector('.gwx-main');
      const tip = box.querySelector('.gwx-methods');
      let cur = null; // key of the open case study

      const renderList = () => {
        ol.innerHTML = list.map((cs, i) => `
          <li data-key="${Lab.esc(cs.key)}">
            <button class="gwi-row gwx-row${cs.key === cur ? ' is-on' : ''}" data-key="${Lab.esc(cs.key)}" style="--h:${hueOf(cs)}; view-transition-name: gwx-row-${caseStudies().findIndex(x => x.key === cs.key)}">
              <span class="gwi-stroke" aria-hidden="true"></span>
              ${Gouache.paint({ hue: hueOf(cs), glyph: '' }, i, 'is-dot')}
              <span class="gwi-num">${String(i + 1).padStart(2, '0')}</span>
              <b class="gwi-title"><span class="gwx-full">${Lab.esc(cs.title)}</span><span class="gwx-short">${Lab.esc(cs.short)}</span>${lockFor(cs)}</b>
              <span class="gwi-type">${Lab.esc(cs.kind)}</span>
              ${cs.methods.length ? `<span class="gwx-mline">${cs.methods.map(Lab.esc).join(' · ')}</span>` : ''}
            </button></li>`).join('');
      };
      renderList();

      const render = cs => {
        const i = list.indexOf(cs);
        main.style.setProperty('--h', hueOf(cs));
        const body = cs.key === METHOD_ENTRY.key ? `<section class="gwx-method is-big" aria-label="Philosophy">${methodPanels()}</section>`
          : !cs.locked ? cs.html
          : unlocked[cs.key] ?? `
            <form class="gwx-lock" data-lock="${Lab.esc(cs.key)}">
              <div class="gwx-lock-row">
                <input type="password" name="pw" autocomplete="current-password" aria-label="Password" placeholder="Password" required>
                <button type="submit">Go</button>
              </div>
              <p class="gwx-lock-err" role="alert"></p>
            </form>`;
        main.innerHTML = `
          <div class="gwx-bar">
            ${HOME}
            <button class="gwx-bar-back" data-back>← All work</button>
            <span class="gwx-bar-nav">
              <button data-step="-1" aria-label="Previous case study" ${i > 0 ? '' : 'disabled'}>‹</button>
              <span>${i + 1} / ${list.length}</span>
              <button data-step="1" aria-label="Next case study" ${i < list.length - 1 ? '' : 'disabled'}>›</button>
            </span>
            <button class="gwx-x" data-back aria-label="Close the case study">×</button>
          </div>
          <div class="gwx-strip-wrap">
          <button class="gwx-strip-btn is-left" data-strip="-1" aria-label="Scroll titles left">‹</button>
          <nav class="gwx-strip" aria-label="Case studies">${list.map(x => `
            <button class="gwx-chip${x === cs ? ' is-on' : ''}" data-key="${Lab.esc(x.key)}" style="--h:${hueOf(x)}">${Lab.esc(x.short)}${lockFor(x)}</button>`).join('')}</nav>
          <button class="gwx-strip-btn is-right" data-strip="1" aria-label="Scroll titles right">›</button>
          </div>
          <header class="gwx-head">
            <p class="gwx-kicker">${Lab.esc(cs.kind)}${cs.minutes ? ` · ${cs.minutes} min read` : ''}</p>
            <h1 class="gw-title">${Lab.esc(cs.title)}</h1>
            ${cs.bootcamp ? '<a class="gwx-pub" href="https://medium.com/design-bootcamp" target="_blank" rel="noopener">published in Bootcamp</a>' : ''}
            ${cs.methods.length ? `<ul class="gwx-tags" aria-label="Research methods">${cs.methods.map(m => `<li>${Lab.esc(m)}</li>`).join('')}</ul>` : ''}
          </header>
          <div class="gwx-article">${body}</div>
          <footer class="gwx-foot">
            ${i > 0 ? `<button data-step="-1">← ${Lab.esc(list[i - 1].short)}</button>` : '<span></span>'}
            ${i < list.length - 1 ? `<button data-step="1">${Lab.esc(list[i + 1].short)} →</button>` : ''}
          </footer>`;
        main.scrollTop = 0;
        // Keep the current title in view in the strip; the arrows show only when there is more to see.
        const strip = main.querySelector('.gwx-strip');
        const chip = strip.querySelector('.gwx-chip.is-on');
        const arrows = () => {
          const wrap = strip.parentElement, max = strip.scrollWidth - strip.clientWidth;
          wrap.classList.toggle('can-left', strip.scrollLeft > 2);
          wrap.classList.toggle('can-right', strip.scrollLeft < max - 2);
        };
        strip.addEventListener('scroll', arrows, { passive: true });
        if (chip) strip.scrollLeft = chip.offsetLeft - strip.clientWidth / 2 + chip.offsetWidth / 2;
        arrows();
      };
      // Switching between the index and the reader morphs the rows into the sidebar when the
      // browser supports view transitions and motion is on.
      const transition = fn => (document.startViewTransition && motion().intensity > 0) ? document.startViewTransition(fn) : fn();
      // is-side: the list docks as a sidebar (only in Sidebar mode while reading).
      const layout = () => {
        const reading = !!cur;
        box.dataset.nav = readerNav;
        box.classList.toggle('is-side', reading && readerNav === 'sidebar');
        box.classList.toggle('no-dots', readerDots === 'hide');
        if (reading && readerNav === 'close') main.style.setProperty('--st', `${box.scrollTop}px`);
      };
      const open = key => {
        const cs = list.find(x => x.key === key);
        if (!cs) return;
        const apply = () => {
          cur = key;
          box.classList.add('is-reading');
          layout();
          ol.querySelectorAll('.gwx-row').forEach(r => r.classList.toggle('is-on', r.dataset.key === key));
          render(cs);
        };
        tip.classList.remove('is-on');
        cur ? apply() : transition(apply);
        ol.querySelector(`.gwx-row[data-key="${CSS.escape(key)}"]`)?.scrollIntoView({ block: 'nearest' });
      };
      const step = d => { const i = list.findIndex(x => x.key === cur) + d; if (list[i]) open(list[i].key); };
      const close = () => transition(() => {
        cur = null;
        box.classList.remove('is-reading');
        layout();
        ol.querySelectorAll('.gwx-row').forEach(r => r.classList.remove('is-on'));
        main.innerHTML = '';
      });

      // The sidebar folds down to a rail of color dots; the choice is remembered.
      const FOLD_KEY = 'hugo-lab:case-sidebar';
      const fold = folded => {
        box.classList.toggle('is-folded', folded);
        const b = box.querySelector('[data-fold]');
        b.setAttribute('aria-expanded', String(!folded));
        b.title = folded ? 'Expand the list' : 'Collapse the list';
        b.firstElementChild.textContent = folded ? '»' : '«';
        localStorage.setItem(FOLD_KEY, folded ? 'folded' : 'open');
      };
      fold(localStorage.getItem(FOLD_KEY) === 'folded');

      Kit.options(root, sc, [
        { id: 'dots', label: 'Color dots', value: readerDots, values: [['show', 'Show'], ['hide', 'Hide']] },
      ], (id, v) => { readerDots = v; layout(); });
      layout();

      // Tab variant: switch between the case studies and the methodology panels.
      const methodEl = box.querySelector('.gwx-mview, .gwx-method.is-big:not(.gwx-article *)');
      const showView = view => {
        box.querySelectorAll('[data-view]').forEach(b => {
          b.setAttribute(b.closest('.gwx-nav') ? 'aria-current' : 'aria-selected', String(b.dataset.view === view));
        });
        if (methodEl) methodEl.hidden = view !== 'method';
        box.querySelector('.gwx-shell').hidden = view === 'method';
        box.scrollTop = 0;
      };
      const markNav = view => box.querySelectorAll('.gwx-nav [data-view]').forEach(b => b.setAttribute('aria-current', String(b.dataset.view === view)));
      if (stack) {
        // One page: the links scroll to a section, and the highlight follows the scroll.
        const casesTop = box.querySelector('.gwx-sec-cases');
        sc.on(box, 'click', e => {
          const t = e.target.closest('.gwx-nav [data-view]');
          if (!t) return;
          if (box.classList.contains('is-reading')) box.querySelector('[data-back]')?.click();
          const target = t.dataset.view === 'method' ? box.querySelector('.gwx-sec') : casesTop;
          box.scrollTo({ top: t.dataset.view === 'method' ? 0 : target.offsetTop - 24, behavior: motion().intensity ? 'smooth' : 'auto' });
          markNav(t.dataset.view);
        });
        sc.on(box, 'scroll', () => markNav(casesTop.getBoundingClientRect().top - box.getBoundingClientRect().top < box.clientHeight / 2 ? 'cases' : 'method'));
      } else {
        // Round five opens on the methodology in the lab, so the layouts are easy to compare.
        if (NAV_VARIANTS.includes(variant)) showView(opts.start || 'method');
        sc.on(box, 'click', e => {
          const t = e.target.closest('[data-view]');
          if (t) showView(t.dataset.view);
        });
      }

      /* Methodology interactions per layout. */
      const setActive = (sel, i) => box.querySelectorAll(sel).forEach(el => el.classList.toggle('is-on', Number(el.dataset.mi) === i));
      if (variant === 'stepper') {
        const pick = e => { const b = e.target.closest('.m-step'); if (b) { setActive('.m-step, .m-frame', Number(b.dataset.mi)); } };
        sc.on(box, 'pointerover', pick); sc.on(box, 'focusin', pick); sc.on(box, 'click', pick);
      }
      if (variant === 'type') sc.on(box, 'click', e => {
        const b = e.target.closest('.m-line');
        if (!b) return;
        box.querySelectorAll('.m-item').forEach(it => {
          const open = it.dataset.mi === b.dataset.mi;
          it.classList.toggle('is-open', open);
          it.querySelector('.m-line').setAttribute('aria-expanded', String(open));
        });
      });
      if (variant === 'film') {
        const track = box.querySelector('.m-track'), count = box.querySelector('.m-count');
        const at = () => Math.round(track.scrollLeft / track.clientWidth);
        const sync = () => { count.textContent = `${num(at())} / ${num(METHOD_PANELS.length - 1)}`; };
        sc.on(track, 'scroll', sync, { passive: true });
        sc.on(box, 'click', e => {
          const b = e.target.closest('[data-film]');
          if (!b) return;
          const i = Math.max(0, Math.min(METHOD_PANELS.length - 1, at() + Number(b.dataset.film)));
          track.scrollTo({ left: i * track.clientWidth, behavior: motion().intensity > 0 ? 'smooth' : 'auto' });
        });
      }

      sc.on(box, 'click', e => {
        if (e.target.closest('[data-fold]')) return fold(!box.classList.contains('is-folded'));
        if (e.target.closest('[data-back]')) return close();
        const row = e.target.closest('.gwx-row, .gwx-chip');
        if (row) return open(row.dataset.key);
        const s = e.target.closest('[data-step]');
        if (s) return step(Number(s.dataset.step));
        const sb = e.target.closest('[data-strip]');
        if (sb) { const strip = main.querySelector('.gwx-strip'); strip.scrollBy({ left: Number(sb.dataset.strip) * strip.clientWidth * 0.7, behavior: motion().intensity > 0 ? 'smooth' : 'auto' }); }
      });
      // Unlock: one password opens every protected case study; it is kept for this browser session.
      const tryUnlock = async password => {
        const keys = list.filter(x => x.locked && !unlocked[x.key]).map(x => x.key);
        let ok = false;
        for (const k of keys) { const html = await decrypt(k, password); if (html != null) { unlocked[k] = html; ok = true; } }
        if (ok) sessionStorage.setItem(PW_KEY, password);
        return ok;
      };
      sc.on(box, 'submit', async e => {
        const form = e.target.closest('[data-lock]');
        if (!form) return;
        e.preventDefault();
        const btn = form.querySelector('button');
        btn.disabled = true; btn.textContent = '…';
        const ok = await tryUnlock(form.pw.value);
        if (!ok) {
          btn.disabled = false; btn.textContent = 'Go';
          form.querySelector('.gwx-lock-err').textContent = 'That is not it. Try again?';
          form.pw.select();
          return;
        }
        renderList();
        render(list.find(x => x.key === cur));
      });
      const saved = sessionStorage.getItem(PW_KEY);
      if (saved) tryUnlock(saved).then(ok => { if (ok) { renderList(); if (cur) render(list.find(x => x.key === cur)); } });

      sc.on(document, 'keydown', e => {
        if (!cur || e.target.closest('input, textarea, select')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowDown' || e.key === 'j') { e.preventDefault(); step(1); }
        if (e.key === 'ArrowUp' || e.key === 'k') { e.preventDefault(); step(-1); }
      });

      /* Hover: the research methods behind the project, in a small card beside the row. */
      sc.on(ol, 'pointerover', e => {
        const row = e.target.closest('.gwx-row');
        if (!row || row.dataset.key === METHOD_ENTRY.key) { tip.classList.remove('is-on'); return; }
        const cs = list.find(x => x.key === row.dataset.key);
        tip.innerHTML = `<p>Methods</p>${cs.methods.length ? `<ul>${cs.methods.map(m => `<li>${Lab.esc(m)}</li>`).join('')}</ul>` : '<span class="gwx-tbd">To be added</span>'}`;
        tip.style.setProperty('--h', hueOf(cs));
        // Anchor to the title text itself: just right of it, centered on the line; below it if there is no room.
        const b = box.getBoundingClientRect();
        const t = [...row.querySelectorAll('.gwx-full, .gwx-short')].find(el => el.offsetParent) || row;
        const range = document.createRange(); range.selectNodeContents(t);
        const r = range.getBoundingClientRect();
        const tw = tip.offsetWidth, th = tip.offsetHeight;
        let x = r.right - b.left + 14, y = r.top - b.top + r.height / 2 - th / 2;
        if (x + tw > b.width - 8) { x = r.left - b.left; y = r.bottom - b.top + 8; }
        if (y + th > b.height - 8) y = r.top - b.top - th - 8;
        tip.style.translate = `${Math.max(8, x)}px ${Math.max(8, y)}px`;
        tip.classList.add('is-on');
      });
      sc.on(ol, 'pointerleave', () => tip.classList.remove('is-on'));

    }

  /* ---------- 11. Index + reader ---------- */
  /* Methodology: three panels; images come later (set img on each). */
  const METHOD_PANELS = [
    { title: 'Ask the right questions', hue: 35, img: null },
    { title: 'Find the right users', hue: 150, img: null },
    { title: 'Track the right metrics', hue: 260, img: null },
  ];
  const methodPanels = () => METHOD_PANELS.map((m, i) => `
    <figure class="gwx-mpanel" style="--h:${m.hue}">
      <div class="gwx-mimg">${m.img ? `<img src="${m.img}" alt="">` : '<span>Image to come</span>'}</div>
      <figcaption><span class="gwx-mnum">${String(i + 1).padStart(2, '0')}</span>${Lab.esc(m.title)}</figcaption>
    </figure>`).join('');
  // Round five: methodology views built for large images.
  let philosophyImgs = [];
  const mImg = m => {
    const src = philosophyImgs[METHOD_PANELS.indexOf(m)] || m.img;
    return `<div class="m-img" style="--h:${m.hue}">${src ? `<img src="${src}" alt="${Lab.esc(m.title)}">` : '<span>Image to come</span>'}</div>`;
  };
  const num = i => String(i + 1).padStart(2, '0');
  const METHOD_VIEWS = {
    // Titles on the left, one large image on the right that follows the active title.
    stepper: () => `
      <section class="gwx-mview m-stepper" aria-label="Philosophy">
        <ol class="m-steps">${METHOD_PANELS.map((m, i) => `<li><button class="m-step${i ? '' : ' is-on'}" data-mi="${i}"><span class="m-num">${num(i)}</span>${Lab.esc(m.title)}</button></li>`).join('')}</ol>
        <div class="m-stage">${METHOD_PANELS.map((m, i) => `<figure class="m-frame${i ? '' : ' is-on'}" data-mi="${i}">${mImg(m)}</figure>`).join('')}</div>
      </section>`,
    // Three huge titles; the open one shows its image full width underneath.
    type: () => `
      <section class="gwx-mview m-type" aria-label="Philosophy">${METHOD_PANELS.map((m, i) => `
        <div class="m-item${i ? '' : ' is-open'}" data-mi="${i}">
          <button class="m-line" aria-expanded="${!i}" data-mi="${i}"><span class="m-num">${num(i)}</span><span class="m-title">${Lab.esc(m.title)}</span></button>
          <div class="m-reveal"><div>${mImg(m)}</div></div>
        </div>`).join('')}
      </section>`,
    // Editorial chapters: number, title, then the image edge to edge, with room between.
    chapters: () => `
      <section class="gwx-mview m-chapters" aria-label="Philosophy">${METHOD_PANELS.map((m, i) => `
        <article class="m-chapter">
          <header><span class="m-num">${num(i)}</span><h2 class="m-title">${Lab.esc(m.title)}</h2></header>
          ${mImg(m)}
        </article>`).join('')}
      </section>`,
    // One image at a time, full width, with arrows and a counter.
    film: () => `
      <section class="gwx-mview m-film" aria-label="Philosophy">
        <div class="m-track">${METHOD_PANELS.map((m, i) => `<figure class="m-slide" data-mi="${i}">${mImg(m)}<figcaption><span class="m-num">${num(i)}</span>${Lab.esc(m.title)}</figcaption></figure>`).join('')}</div>
        <div class="m-controls"><button data-film="-1" aria-label="Previous">‹</button><span class="m-count">01 / ${num(METHOD_PANELS.length - 1)}</span><button data-film="1" aria-label="Next">›</button></div>
      </section>`,
  };
  const NAV_VARIANTS = Object.keys(METHOD_VIEWS);

  // The methodology as an entry at the top of the list ('entry' variant).
  const METHOD_ENTRY = { key: 'methodology', title: 'Philosophy', short: 'Philosophy', kind: 'How I work', methods: [] };
  // Home: the tea cup from the desk, top left, no background. data-go="home" is the lab's navigation hook.
  const HOME = `<button class="gwx-home" data-go="home" aria-label="Home" title="Home"><svg viewBox="0 0 48 44" aria-hidden="true"><path d="M8 18h26v8a11 11 0 0 1-11 11h-4A11 11 0 0 1 8 26Z"/><path d="M34 21h3a5 5 0 0 1 0 10h-4"/><path d="M5 40h34"/><path d="M16 4c-2 3 2 5 0 8M23 3c-2 3 2 5 0 8M30 4c-2 3 2 5 0 8"/></svg></button>`;

  R('gw-reader', 'Index + reader',
    'The Painted index, filled with the real case studies from Medium. Pick one and the list slides into a sidebar on the left; the article reads in the main panel in the site\'s own paper and type. Hover a title for the research methods.',
    [{ name: 'Painted index (kept)', url: '#', borrow: 'the list and its brush stroke' },
     { name: 'Mail and docs apps', url: 'https://en.wikipedia.org/wiki/Master%E2%80%93detail_interface', borrow: 'list on the left, reading on the right' },
     { name: 'Medium', url: 'https://medium.com/@sneha_s', borrow: 'the articles themselves, restyled to match' }],
    ['Every title fits on one line', 'Articles render in the site\'s type and colors, at a 68-character measure', 'Methods appear on hover, so the list stays quiet', 'Esc or All work returns to the index'],
readerMount('none'), { how: 'Click a case study to read it; hover one to see the research methods. Move between articles with the strip of titles at the top, the ‹ › arrows, or ↑ ↓; Esc goes back.' });

  /* ================= Round four: a methodology section ================= */
  const M_INSP = [{ name: 'Index + reader (v5)', url: '#', borrow: 'everything else, unchanged' }];
  const M_READ = ['Three panels, three short titles', 'Your photo, top left, goes home', 'The case studies work exactly as in v5'];
  const M_HOW = 'Click your photo to go home. Click a case study to read it; hover for the research methods.';
  R('gw-m-top', 'Triptych up top', 'The three methodology panels sit in a row above the case studies, so the way you work is the first thing people see.', M_INSP, M_READ, readerMount('top'), { how: M_HOW });
  R('gw-m-tab', 'Methodology tab', 'A quiet Case studies | Methodology switch at the top. The methodology gets its own view with the three panels large.', M_INSP, M_READ, readerMount('tab'), { how: M_HOW + ' Use the switch at the top for the methodology.' });
  R('gw-m-entry', 'First entry', 'Methodology is the first item in the list and the title strip, and opens like a case study with the three panels.', M_INSP, M_READ, readerMount('entry'), { how: M_HOW + ' Methodology is the first entry.' });
  R('gw-m-side', 'Side column', 'The three panels stack in a slim column beside the list, always in view while you browse the case studies.', M_INSP, M_READ, readerMount('side'), { how: M_HOW });

  /* ================= Round five: a methodology view built for large images ================= */
  const M5_INSP = [{ name: 'Editorial and product storytelling pages', url: 'https://stripe.com/sessions', borrow: 'one idea at a time, given room' }];
  const M5_READ = ['Images get the full reading width', 'One idea at a time, in a set order', 'Case studies and Philosophy are two quiet text links beside your photo'];
  const M5_HOW = 'Case studies and Philosophy are the links beside your photo; the photo goes home.';
  R('gw-m5-stepper', 'Stepper', 'Three numbered titles on the left; one large image on the right follows whichever title you point at.', M5_INSP, M5_READ, readerMount('stepper'), { how: M5_HOW + ' Point at a title to change the image.' });
  R('gw-m5-type', 'Big type', 'The three titles set huge in your name\'s rust lettering. Open one and its image unfolds full width beneath it, one at a time.', M5_INSP, M5_READ, readerMount('type'), { how: M5_HOW + ' Click a title to open its image.' });
  R('gw-m5-chapters', 'Chapters', 'Three full-width chapters that scroll like an editorial piece: number, title, then the image edge to edge.', M5_INSP, M5_READ, readerMount('chapters'), { how: M5_HOW + ' Scroll through the three chapters.' });
  R('gw-m5-film', 'Filmstrip', 'One image at a time at full width, with its title, arrows, and a quiet counter. Swipe or click through.', M5_INSP, M5_READ, readerMount('film'), { how: M5_HOW + ' Use the arrows or swipe.' });

  /* ================= Picked: Stepper ================= */
  R('gw-work', 'Work: Stepper', 'The Work page as picked: case studies first, one scrolling page: the philosophy (formerly methodology) as a Stepper first, the case studies underneath (Philosophy / Case studies beside your photo scroll to each).',
    [{ name: 'Work v7: Stepper', url: '#', borrow: 'the methodology layout' }, { name: 'Work v5: Index + reader', url: '#', borrow: 'the case studies' }],
    M5_READ, readerMount('stepper', { stack: true }), { how: M5_HOW + ' On Philosophy, point at a title to change the image.' });
})();
