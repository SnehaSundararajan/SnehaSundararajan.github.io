/* ==========================================================================
   Desk styles engine. One desk, many looks.
   Every style uses the exact same objects (name, roles, nav and
   decoration stickers), the same behavior (drag, toss, tilt), and
   the same small circle cursor. Only the design style changes.

   The circle reveals a second rendering of the same desk underneath:
   an inverse of the current style, or the Sketch, Stickers, or Minimal look.

   Styles are pure CSS (css/desk-styles.css), scoped by .ds-style-<id>.
   `outlined` styles draw each shape as a line (shared Staging.outline);
   the rest fill the shape (shared Kit.sticker). Sizes always come from the
   same sticker boxes, so the two layers line up.
   ========================================================================== */

window.DeskStyles = (function () {
  const STYLES = {
    sticker: { outlined: false },
    sketch:  { outlined: true, notes: true },
    minimal: { outlined: true },
    glass:   { outlined: false },
    paper:   { outlined: false },
    clay:    { outlined: false },
    riso:    { outlined: false },
    brutal:  { outlined: true },
    enamel:  { outlined: false },
    dymo:    { outlined: false },
    linocut: { outlined: false },
    halftone:{ outlined: true },
    xerox:   { outlined: false },
    stamp:   { outlined: true },
    marker:  { outlined: true },
    letterpress: { outlined: false },
    blueprint: { outlined: true },
    inkwash: { outlined: true },
    watercolor: { outlined: false },
    gouache: { outlined: false },
    sumi: { outlined: true },
    fineliner: { outlined: true },
    pencilwash: { outlined: true },
    charcoal: { outlined: true },
    indigo: { outlined: true },
    colorpencil: { outlined: true },
  };
  // What the circle shows by default for each style.
  // Paint styles reveal their pencil underdrawing; Sketch reveals the painting.
  const DEFAULT_REVEAL = {
    sticker: 'sketch', sketch: 'inkwash', inkwash: 'sketch', watercolor: 'sketch', gouache: 'sketch', sumi: 'sketch',
    fineliner: 'sketch', pencilwash: 'inkwash', charcoal: 'sketch', indigo: 'sketch', colorpencil: 'sketch',
  };
  const reveal = {};
  let currentReveal = () => null; // the mounted desk's circle choice, for Copy settings

  function descriptors(c, narrow) {
    const d = Staging.deskData(c, narrow);
    const flow = [
      ...d.words.map((w, i) => ({ kind: 'word', label: w, rot: i % 2 ? 2 : -3 })),
      ...d.roles.map((r, i) => ({ kind: 'role', label: r, color: d.pills[i % d.pills.length], rot: [-4, 3, -2][i % 3] })),
    ];
    const deco = d.scatter.map(([label, shape, color, xp, yp, rot, go, icon, img, hover]) => ({ kind: 'deco', label, shape, color, xp, yp, rot, go, icon, img, hover }));
    return { flow, deco, notes: d.notes, anchor: d.anchor };
  }

  function markup(desc, style, notes, { fixed = null, interactive = true } = {}) {
    const inner = {
      word: () => `<span class="ds-word">${Lab.esc(desc.label)}</span>`,
      role: () => `<span class="ds-role" style="--c:${desc.color}"><span class="ds-txt">${Lab.esc(desc.label)}</span></span>`,
      tag:  () => `<span class="ds-tag"><span class="ds-txt">${Lab.esc(desc.label)}</span></span>`,
      deco: () => Kit.sticker({ shape: desc.shape, label: desc.label, color: desc.color, rot: 0, icon: desc.icon, img: desc.img, hover: desc.hover }),
    }[desc.kind]();
    // Handwritten notes belong to the visible desk only; the layer under the circle stays clean.
    const note = interactive && STYLES[style]?.notes && notes[desc.label] ? `<em class="it1-note-hand">${Lab.esc(notes[desc.label])}</em>` : '';
    const name = { linkedin: 'LinkedIn', email: 'Copy email address' }[desc.go] || desc.label;
    const go = interactive && desc.go ? `data-go="${desc.go}" role="link" tabindex="0" aria-label="${Lab.esc(name)}"` : 'aria-hidden="true"';
    const size = fixed ? `style="width:${fixed.w}px; height:${fixed.h}px"` : '';
    return `<div class="ds-item ds-k-${desc.kind}${desc.shape ? ` ds-shape-${desc.shape}` : ''}" ${go} ${size}>
      <div class="ds-face" style="--r:${desc.rot}deg">${inner}</div>${note}</div>`;
  }

  /** Draw line outlines inside every decoration sticker of a layer. */
  function outlineDeco(layer, items) {
    layer.querySelectorAll('.ds-k-deco').forEach((el, i) => {
      const it = items.filter(x => x.desc.kind === 'deco')[i];
      const face = el.querySelector('.d-face');
      if (face && it) face.insertAdjacentHTML('afterbegin', Staging.outline(it.desc.shape, face.offsetWidth, face.offsetHeight));
    });
  }

  /**
   * Keeps stickers from overlapping at any stage size. Positions are percentages but sticker sizes
   * are fixed, so narrow or short stages can crowd. A few relaxation passes push overlapping
   * stickers apart along the shorter overlap (the name and roles never move) and keep them on stage.
   */
  function separate(items, W, H, gap = 8) {
    // Work with each sticker's rotated footprint, centered on its position.
    const foot = it => {
      const r = Math.abs((it.desc.rot || 0) * Math.PI / 180);
      return { w: it.w * Math.cos(r) + it.h * Math.sin(r), h: it.w * Math.sin(r) + it.h * Math.cos(r) };
    };
    const free = items.filter(it => it.desc.kind === 'deco');
    for (let pass = 0; pass < 100; pass++) {
      let moved = false;
      for (const a of free) {
        const fa = foot(a);
        for (const b of items) {
          if (a === b) continue;
          const fb = foot(b);
          const ax = a.x + a.w / 2, ay = a.y + a.h / 2, bx = b.x + b.w / 2, by = b.y + b.h / 2;
          const ox = (fa.w + fb.w) / 2 + gap - Math.abs(ax - bx);
          const oy = (fa.h + fb.h) / 2 + gap - Math.abs(ay - by);
          if (ox <= 0 || oy <= 0) continue;
          const share = b.desc.kind === 'deco' ? 0.5 : 1; // fixed text: the sticker takes the whole move
          if (ox < oy) { const d = (ax < bx ? -1 : 1) * ox * share; a.x += d; if (share < 1) b.x -= d; }
          else { const d = (ay < by ? -1 : 1) * oy * share; a.y += d; if (share < 1) b.y -= d; }
          moved = true;
        }
        const dx = (fa.w - a.w) / 2, dy = (fa.h - a.h) / 2;
        a.x = Math.max(6 + dx, Math.min(W - a.w - 6 - dx, a.x));
        a.y = Math.max(6 + dy, Math.min(H - a.h - 6 - dy, a.y));
      }
      if (!moved) break;
    }
  }


  /**
   * opts.reveal: what the circle shows. opts.locked: keep that choice and hide the switcher
   * (staging iterations that have been signed off). opts.radius: circle radius, a number or a
   * function read every frame.
   */
  function mount(root, api, styleId, opts = {}) {
    const choiceFor = () => opts.reveal || reveal[styleId] || DEFAULT_REVEAL[styleId] || 'inverse';
    const { scope: sc, content: c, motion } = api;
    const narrow = root.clientWidth < 700;
    const { flow, deco, notes, anchor } = descriptors(c, root.clientWidth);

    root.innerHTML = `
      <div class="ds">
        <h1 class="sr">${Lab.esc(c.name)}. ${Lab.esc(c.role)}.</h1>
        <div class="ds-layer ds-top ds-style-${styleId}">
          <div class="ds-flow">
            <div class="ds-line">${flow.filter(f => f.kind === 'word').map(f => markup(f, styleId, notes)).join('')}</div>
            <div class="ds-line">${flow.filter(f => f.kind === 'role').map(f => markup(f, styleId, notes)).join('')}</div>
          </div>
          ${deco.map(f => markup(f, styleId, notes)).join('')}
        </div>
        <div class="ds-layer ds-under" aria-hidden="true"></div>
        <div class="ds-ring" aria-hidden="true"></div>
        ${Staging.roughFilter}
        <svg width="0" height="0" style="position:absolute" aria-hidden="true">
          <filter id="ds-pixel" x="0" y="0"><feFlood x="3" y="3" height="1" width="1"/><feComposite width="7" height="7"/><feTile result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/><feMorphology operator="dilate" radius="3.5"/></filter>
          <filter id="ds-pixel-sm" x="0" y="0"><feFlood x="2" y="2" height="1" width="1"/><feComposite width="5" height="5"/><feTile result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/><feMorphology operator="dilate" radius="2.5"/></filter>
          <filter id="ds-wc"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="4" result="t"/><feDisplacementMap data-wobble="shape" data-base="10" in="SourceGraphic" in2="t" scale="10" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="0.8"/></filter>
          <filter id="ds-wc-soft"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="4" result="t"/><feDisplacementMap data-wobble="text" data-base="3.5" in="SourceGraphic" in2="t" scale="3.5" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="0.35"/></filter>
          <filter id="ds-brush"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="9" result="t"/><feDisplacementMap data-wobble="shape" data-base="5" in="SourceGraphic" in2="t" scale="5"/></filter>
          <filter id="ds-text"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="11" result="t"/><feDisplacementMap data-wobble="text" data-base="3" in="SourceGraphic" in2="t" scale="1"/></filter>
          <filter id="ds-charcoal"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n"/><feDisplacementMap data-wobble="shape" data-base="2.5" in="SourceGraphic" in2="n" scale="2.5" result="d"/><feGaussianBlur in="d" stdDeviation="0.6"/></filter>
          <filter id="ds-distress"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 1.75" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter>
        </svg>
      </div>`;

    const box = root.querySelector('.ds');
    const top = root.querySelector('.ds-top');
    const under = root.querySelector('.ds-under');
    const ring = root.querySelector('.ds-ring');
    const W = box.clientWidth, H = box.clientHeight;

    // Measure reading order for the text stickers; place decoration by percentage.
    const descs = [...flow, ...deco];
    const els = [...top.querySelectorAll('.ds-item')];
    // Where the name and roles end, for layouts that place stickers relative to them (phone).
    const flowBottom = Math.max(...els.filter((el, i) => descs[i].kind !== 'deco').map(el => {
      let y = el.offsetHeight; for (let n = el; n && n !== box; n = n.offsetParent) y += n.offsetTop; return y;
    }));
    const yOf = yp => anchor == null ? (yp / 100) * H : flowBottom + ((yp - anchor) / (100 - anchor)) * (H - flowBottom);
    // api.fit (the website, where the stage is the whole window): decoration stickers grow with the
    // stage (measured against the lab's ~1100 × 640 preview), never below their lab size, and gather a
    // little toward their middle so gaps stay tight.
    // Phones keep the hand-placed layout. Sizes below are the scaled, on-screen box (scale origin top left).
    const k = api.fit && anchor == null ? Math.min(1.6, Math.max(1, Math.min(W / 1100, H / 640))) : 1;
    box.style.setProperty('--k', k);
    const decos = descs.filter(d => d.kind === 'deco');
    const mx = decos.reduce((a, d) => a + d.xp, 0) / decos.length, my = decos.reduce((a, d) => a + d.yp, 0) / decos.length;
    const gather = api.fit && anchor == null ? 0.9 : 1;
    const items = els.map((el, i) => {
      const desc = descs[i];
      const s = desc.kind === 'deco' ? k : 1;
      const w = el.offsetWidth * s, h = el.offsetHeight * s;
      let x, y;
      if (desc.kind === 'deco') {
        const xp = mx + (desc.xp - mx) * gather, yp = my + (desc.yp - my) * gather;
        x = (xp / 100) * W - w / 2; y = yOf(yp) - h / 2;
      }
      else { x = 0; y = 0; for (let n = el; n && n !== box; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; } }
      el.firstElementChild.dataset.reveal = '';
      el.firstElementChild.style.setProperty('--i', 0.2 + i * 0.12);
      return { el, desc, x, y, w, h, s };
    });
    // Phone keeps your hand-placed arrangement (light overlaps are part of it); other layouts get spaced out.
    if (anchor == null) separate(items, W, H);
    items.forEach(it => { it.el.style.width = `${it.w / it.s}px`; top.appendChild(it.el); });
    top.querySelector('.ds-flow').remove();
    if (STYLES[styleId].outlined) outlineDeco(top, items);

    Kit.tossable(sc, motion, box, items, { friction: 0.9, bounce: 0.5, edge: 0.2 });

    // The layer the circle reveals.
    let twins = [];
    function buildUnder() {
      const choice = choiceFor();
      const style = choice === 'inverse' ? styleId : choice;
      under.className = `ds-layer ds-under ds-style-${style}${choice === 'inverse' ? ' is-inverse' : ''}`;
      under.innerHTML = items.map(it => markup(it.desc, style, notes, { fixed: { w: it.w / it.s, h: it.h / it.s }, interactive: false })).join('');
      if (STYLES[style].outlined) outlineDeco(under, items);
      twins = [...under.querySelectorAll('.ds-item')].map((el, i) => ({ el, face: el.firstElementChild, src: items[i] }));
      // The name under the circle uses the top layer's letter metrics, so both spell out the same length.
      twins.forEach(t => {
        if (t.src.desc.kind !== 'word') return;
        const word = t.el.querySelector('.ds-word'), ref = t.src.el.querySelector('.ds-word');
        const cs = getComputedStyle(ref);
        ['fontFamily', 'fontWeight', 'fontSize', 'letterSpacing', 'lineHeight'].forEach(k => { word.style[k] = cs[k]; });
      });
    }
    buildUnder();
    currentReveal = choiceFor;

    if (!opts.locked) {
      const bar = Kit.options(root, sc, [{
        id: 'reveal', label: 'Circle shows', value: choiceFor(),
        values: [['inverse', 'Inverse'], ['sketch', 'Sketch'], ['inkwash', 'Ink & wash'], ['sticker', 'Stickers'], ['minimal', 'Minimal']],
      }], (_, v) => { reveal[styleId] = v; buildUnder(); }, 'bottom');
      bar.classList.add('ds-opts');
    }

    // Wobble sliders scale every displacement filter in this desk, live.
    // Shape wobble 0..1 maps to 0..2× each filter's base; text wobble 0..1 to 0..2× its base.
    const applyWobble = () => {
      const { wobble, textWobble } = Lab.state.deskStyle;
      box.querySelectorAll('feDisplacementMap[data-wobble]').forEach(f => {
        const k = f.dataset.wobble === 'text' ? textWobble : wobble;
        f.setAttribute('scale', (Number(f.dataset.base) * k * 2).toFixed(2));
      });
    };
    applyWobble();
    sc.add(Lab.subscribe((st, changed) => { if (changed.includes('deskStyle')) applyWobble(); }));

    // Twins follow their stickers (position, tilt, lift).
    sc.frame(() => twins.forEach(t => {
      t.el.style.translate = t.src.el.style.translate;
      t.face.style.setProperty('--tilt', t.src.el.firstElementChild.style.getPropertyValue('--tilt') || '0deg');
      t.el.classList.toggle('is-held', !!t.src.held);
    }));

    // Reveal circle locked to the pointer, with a small dot marking the real cursor.
    Staging.peek(sc, box, root, {
      R: opts.radius || (narrow ? 64 : 80),
      start: { x: items[0].x + items[0].w / 2, y: items[0].y + items[0].h / 2 },
      paint: (x, y, r) => {
        under.style.clipPath = `circle(${r.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
        ring.style.cssText = `translate:${x - r}px ${y - r}px; width:${r * 2}px; height:${r * 2}px; opacity:${r > 2 ? 1 : 0}`;
      },
    });
  }

  return { mount, STYLES, currentReveal: () => currentReveal() };
})();
