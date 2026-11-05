/* ==========================================================================
   Work: shared helpers for the Work layouts tab.
   - list()     projects sorted and trimmed by the layout levers
   - attrs()    data attributes that let CSS apply card style, media, info, fx
   - card()     one project card that honors every layout lever
   - meta()     the metadata line(s) the levers ask for
   - filters()  tag filter chips
   - bind()     click to open the quick view, plus tilt / spotlight hover
   - sheet()    the quick-view panel for a project
   ========================================================================== */

(function () {
  const L = () => Lab.state.layout;

  function list(tag = null) {
    const l = L();
    let ps = Lab.PROJECTS.slice();
    if (l.sort === 'newest') ps.sort((a, b) => b.year - a.year);
    else if (l.sort === 'az') ps.sort((a, b) => a.title.localeCompare(b.title));
    else ps.sort((a, b) => (b.weight - a.weight) || (b.year - a.year));
    ps = ps.slice(0, l.count);
    return tag ? ps.filter(p => p.tags.includes(tag)) : ps;
  }

  function attrs() {
    const l = L();
    return `data-card="${l.card}" data-media="${l.media}" data-info="${l.info}" data-fx="${l.fx}" style="--wk-ratio:${l.ratio}"`;
  }

  function meta(p, { inline = false } = {}) {
    const m = L().meta;
    const bits = [];
    if (m.year) bits.push(`<span class="wk-year">${p.year}</span>`);
    if (m.role) bits.push(`<span class="wk-role">${Lab.esc(p.role)}</span>`);
    const line = bits.length ? `<span class="wk-meta">${bits.join('<i>·</i>')}</span>` : '';
    const tags = m.tags ? `<span class="wk-tags">${p.tags.map(t => `<span>${Lab.esc(t)}</span>`).join('')}</span>` : '';
    const impact = m.impact ? `<span class="wk-impact">${Lab.esc(p.impact)}</span>` : '';
    const blurb = m.blurb && !inline ? `<span class="wk-blurb">${Lab.esc(p.blurb)}</span>` : '';
    return line + blurb + impact + tags;
  }

  function media(p, extra = '') {
    return `<span class="wk-media ${extra}" style="--h:${p.hue}"><span class="wk-glyph" aria-hidden="true">${p.glyph}</span></span>`;
  }

  function card(p, { cls = '', style = '', ratio = true, i = 0 } = {}) {
    return `
      <button class="wk-card ${cls}" data-pid="${p.id}" data-reveal style="--i:${i * 0.12}; ${style}">
        ${L().media === 'none' ? '' : media(p, ratio ? 'has-ratio' : '')}
        <span class="wk-info">
          <span class="wk-type">${Lab.esc(p.type)}</span>
          <b class="wk-title">${Lab.esc(p.title)}</b>
          ${meta(p)}
        </span>
      </button>`;
  }

  function filters(root, sc, projects, onPick) {
    if (!L().filters) return null;
    const tags = [...new Set(projects.flatMap(p => p.tags))];
    const bar = document.createElement('div');
    bar.className = 'wk-filters';
    bar.innerHTML = ['All', ...tags].map((t, i) => `<button class="${i === 0 ? 'is-on' : ''}" data-tag="${i === 0 ? '' : Lab.esc(t)}">${Lab.esc(t)}</button>`).join('');
    sc.on(bar, 'click', e => {
      const b = e.target.closest('[data-tag]');
      if (!b) return;
      bar.querySelectorAll('button').forEach(x => x.classList.toggle('is-on', x === b));
      onPick(b.dataset.tag || null);
    });
    return bar;
  }

  function sheet(root, sc, p) {
    root.querySelector('.wk-sheet')?.remove();
    const el = document.createElement('div');
    el.className = 'wk-sheet';
    el.innerHTML = `
      <div class="wk-sheet-backdrop" data-close></div>
      <article class="wk-sheet-panel" role="dialog" aria-label="${Lab.esc(p.title)}">
        <button class="wk-sheet-close" data-close aria-label="Close">×</button>
        <span class="wk-sheet-media" style="--h:${p.hue}"><span>${p.glyph}</span></span>
        <p class="wk-sheet-type">${Lab.esc(p.type)} · ${p.year}</p>
        <h3>${Lab.esc(p.title)}</h3>
        <p class="wk-sheet-blurb">${Lab.esc(p.blurb)}</p>
        <dl><dt>Role</dt><dd>${Lab.esc(p.role)}</dd><dt>Impact</dt><dd>${Lab.esc(p.impact)}</dd><dt>Tags</dt><dd>${p.tags.map(Lab.esc).join(', ')}</dd></dl>
        <a href="#work" data-go="work" class="wk-sheet-cta">Read the case study →</a>
      </article>`;
    root.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-open'));
    const close = () => { el.classList.remove('is-open'); setTimeout(() => el.remove(), 250); };
    el.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
    sc.on(document, 'keydown', e => { if (e.key === 'Escape') close(); });
  }

  /** Delegated click to open projects, plus tilt and spotlight hover effects. */
  function bind(root, sc, { open = true } = {}) {
    if (open) sc.on(root, 'click', e => {
      const c = e.target.closest('[data-pid]');
      if (!c || c.dataset.dragged === 'true' || e.target.closest('.wk-sheet')) return;
      const p = Lab.PROJECTS.find(x => x.id === c.dataset.pid);
      if (p) sheet(root, sc, p);
    });
    const fx = L().fx;
    if (fx !== 'tilt' && fx !== 'spotlight') return;
    sc.on(root, 'pointermove', e => {
      const mo = Lab.motion();
      if (!mo.types.hover) return;
      const c = e.target.closest('.wk-card');
      if (!c) return;
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      if (fx === 'tilt') {
        c.style.setProperty('--rx', `${((0.5 - y) * 8 * mo.intensity).toFixed(2)}deg`);
        c.style.setProperty('--ry', `${((x - 0.5) * 8 * mo.intensity).toFixed(2)}deg`);
      } else {
        c.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
        c.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      }
    });
    sc.on(root, 'pointerout', e => {
      const c = e.target.closest('.wk-card');
      if (c && !c.contains(e.relatedTarget)) { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg'); }
    });
  }

  /** Small section header most layouts share. */
  const head = (title, sub) => `<header class="wk-head" data-reveal style="--i:0"><h2>${title}</h2><p>${sub}</p></header>`;

  window.Work = { list, attrs, meta, media, card, filters, sheet, bind, head };
})();
