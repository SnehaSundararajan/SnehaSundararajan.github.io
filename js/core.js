/* ==========================================================================
   Lab core: state, levers, motion math, concept registry, small utilities.
   Classic script (no modules) so index.html works straight from the file
   system with no server or build step.
   ========================================================================== */

(function () {
  const STORAGE_KEY = 'hugo-lab:v1';

  const TYPES = ['entrance', 'ambient', 'cursor', 'hover', 'text', 'customCursor'];

  const PRESETS = {
    still:   { intensity: 0,    speed: 1,    easing: 'smooth',
               types: { entrance: false, ambient: false, cursor: false, hover: false, text: false, customCursor: false } },
    calm:    { intensity: 0.35, speed: 0.75, easing: 'smooth',
               types: { entrance: true,  ambient: true,  cursor: false, hover: true,  text: false, customCursor: false } },
    lively:  { intensity: 0.7,  speed: 1,    easing: 'snappy',
               types: { entrance: true,  ambient: true,  cursor: true,  hover: true,  text: true,  customCursor: false } },
    chaotic: { intensity: 1,    speed: 1.4,  easing: 'springy',
               types: { entrance: true,  ambient: true,  cursor: true,  hover: true,  text: true,  customCursor: true } },
  };

  const EASINGS = {
    smooth:  'cubic-bezier(0.22, 1, 0.36, 1)',
    snappy:  'cubic-bezier(0.16, 1, 0.3, 1)',
    springy: 'linear(0, 0.009, 0.035 2.1%, 0.141, 0.281 6.7%, 0.723 12.9%, 0.938 16.7%, 1.017, 1.077, 1.121, 1.149 24.3%, 1.159, 1.163, 1.161, 1.154 29.9%, 1.129 32.8%, 1.051 39.6%, 1.017 43.1%, 0.991, 0.977 51%, 0.974 53.8%, 0.975 57.1%, 0.997 69.8%, 1.003 76.9%, 1.004 83.8%, 1)',
    linear:  'linear',
  };

  // JS twins of the CSS curves, for animations driven from requestAnimationFrame.
  const EASE_FN = {
    smooth:  t => 1 - Math.pow(1 - t, 4),
    snappy:  t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    springy: t => 1 - Math.cos(t * Math.PI * 2.5) * Math.exp(-5 * t),
    linear:  t => t,
  };

  // Top bar: Staging, plus UI elements (every other tab, shown as a second row).
  const TABS = [
    { id: 'staging',  label: 'Staging' },
    { id: 'styles',   label: 'Desk styles',        group: 'ui' },
    { id: 'hero',     label: 'Hero concepts',      group: 'ui' },
    { id: 'stickers', label: 'Stickers & physics', group: 'ui' },
    { id: 'canvas',   label: 'Canvas studies',     group: 'ui' },
    { id: 'cursor',   label: 'Cursor lab',         group: 'ui' },
    { id: 'work',     label: 'Work layouts',       group: 'ui' },
    { id: 'about',    label: 'About me',           group: 'ui' },
  ];

  const DEFAULTS = {
    theme: 'system',
    tab: 'staging',
    // Branding set applied to the stage on the Staging tab.
    brand: 'paper',
    // Desk styles: hand-made feel. Shape and text wobble (0 to 1), label weight.
    deskStyle: { wobble: 0.5, textWobble: 0.12, weight: 600 },
    concept: { staging: 'it6', styles: 'gouache', hero: 'desk', stickers: 'gravity', canvas: 'aquarium', cursor: 'xray', work: 'gw-work', about: 'portrait' },
    // Which version each tab shows (see js/versions.js); unset means the newest.
    version: {},
    // The UI elements tab to return to from Staging.
    lastUi: 'styles',
    preset: 'lively',
    ...structuredClone(PRESETS.lively),
    respectReducedMotion: true,
    accentHue: 262,
    texture: false,
    // Work layout levers (only shown on the Work layouts tab).
    layout: {
      columns: 4, gap: 14, radius: 18, count: 9,
      card: 'raised',      // flat | outlined | raised | glass | bold
      media: 'color',      // color | mono | pattern | none
      ratio: '4/3',        // 1/1 | 4/3 | 16/9 | 3/4
      info: 'below',       // below | overlay | hover
      fx: 'lift',          // none | lift | tilt | zoom | spotlight
      sort: 'featured',    // featured | newest | az
      filters: true,
      meta: { year: true, role: true, tags: true, impact: false, blurb: false },
    },
    viewport: 'full',
    content: {
      name: 'Sneha Sundar',
      // Middle dots (·), not periods, so they sit at mid-height between the words.
      role: 'designer · researcher · builder',
      tagline: 'I make complicated software feel calm.',
      email: 'sneha.sundar.designs@gmail.com',
      location: 'Your City',
      linkedin: 'https://www.linkedin.com/in/sneha-sundararajan/',
    },
  };

  // Earlier placeholder content. Saved values that still match these are
  // replaced by the current defaults; anything the user typed is kept.
  const OLD_PLACEHOLDERS = { name: ['Your Name'], role: ['Product designer & design engineer', 'designer · researcher · coder'], email: ['hello@yourname.com', 'snehasundardesigns.com'] };

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!saved) return structuredClone(DEFAULTS);
      // The shortlist and More menu were replaced by versions.
      delete saved.archived; delete saved.archiveVersion;
      if (!TABS.some(t => t.id === saved.tab)) saved.tab = DEFAULTS.tab;
      if (saved.content) {
        Object.entries(OLD_PLACEHOLDERS).forEach(([k, olds]) => { if (olds.includes(saved.content[k])) delete saved.content[k]; });
      }
      return {
        ...structuredClone(DEFAULTS),
        ...saved,
        types: { ...DEFAULTS.types, ...saved.types },
        content: { ...DEFAULTS.content, ...saved.content },
        concept: { ...DEFAULTS.concept, ...saved.concept },
        layout: { ...DEFAULTS.layout, ...saved.layout, meta: { ...DEFAULTS.layout.meta, ...saved.layout?.meta } },
        deskStyle: { ...DEFAULTS.deskStyle, ...saved.deskStyle },
      };
    } catch {
      return structuredClone(DEFAULTS);
    }
  }

  let state = load();
  const listeners = new Set();
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const darkQuery = matchMedia('(prefers-color-scheme: dark)');

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function set(patch) {
    const changed = Object.keys(patch);
    state = { ...state, ...patch };
    save();
    applyRoot();
    listeners.forEach(fn => fn(state, changed));
  }

  /** Effective motion after reduced-motion and intensity rules are applied. */
  function motion() {
    const reduced = state.respectReducedMotion && reducedQuery.matches;
    const intensity = reduced ? 0 : state.intensity;
    const types = { ...state.types };
    if (intensity === 0) {
      types.ambient = false;
      types.cursor = false;
      types.text = false;
      types.customCursor = false;
    }
    return {
      intensity,
      speed: state.speed,
      easing: state.easing,
      ease: EASE_FN[state.easing] || EASE_FN.smooth,
      types,
      reduced,
      /** Scale a base duration in ms by the speed lever. */
      ms: base => base / state.speed,
    };
  }

  function resolvedTheme() {
    if (state.theme === 'system') return darkQuery.matches ? 'dark' : 'light';
    return state.theme;
  }

  function applyRoot() {
    const root = document.documentElement;
    const m = motion();
    if (state.theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = state.theme;
    root.style.setProperty('--m', m.intensity);
    root.style.setProperty('--dur', (1 / state.speed).toFixed(3));
    root.style.setProperty('--ease', EASINGS[state.easing] || EASINGS.smooth);
    root.style.setProperty('--accent-h', state.accentHue);
  }

  reducedQuery.addEventListener('change', () => set({}));
  darkQuery.addEventListener('change', () => set({}));

  /* ---------- Concept registry ---------- */

  const registry = {};

  /**
   * Register a concept under a tab. Shape:
   * { id, title, family?, oneLiner, levers: [...TYPES], inspiration: [{name, url, borrow}],
   *   readability: [...], ownsCursor?: bool, mount(root, api) -> optional cleanup }
   * `family` groups related concepts under a small label in the concept bar.
   */
  function register(tab, concept) {
    (registry[tab] ||= []).push(concept);
  }

  /* ---------- Lifecycle scope: everything a concept starts gets torn down ---------- */

  function scope() {
    const disposers = [];
    const frames = new Set();
    let raf = 0;
    const loop = t => {
      frames.forEach(fn => fn(t));
      raf = frames.size ? requestAnimationFrame(loop) : 0;
    };
    return {
      on(target, type, fn, opts) {
        target.addEventListener(type, fn, opts);
        disposers.push(() => target.removeEventListener(type, fn, opts));
      },
      frame(fn) {
        frames.add(fn);
        if (!raf) raf = requestAnimationFrame(loop);
        return () => frames.delete(fn);
      },
      timeout(fn, ms) {
        const id = setTimeout(fn, ms);
        disposers.push(() => clearTimeout(id));
        return id;
      },
      interval(fn, ms) {
        const id = setInterval(fn, ms);
        disposers.push(() => clearInterval(id));
        return id;
      },
      observe(el, fn) {
        const ro = new ResizeObserver(fn);
        ro.observe(el);
        disposers.push(() => ro.disconnect());
      },
      add(fn) { disposers.push(fn); },
      dispose() {
        frames.clear();
        if (raf) cancelAnimationFrame(raf);
        disposers.splice(0).reverse().forEach(fn => fn());
      },
    };
  }

  /* ---------- Utilities ---------- */

  const esc = s => String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /** Frame-rate independent smoothing factor, scaled by the speed lever. */
  const damp = (base, dtMs) => 1 - Math.pow(1 - base, (dtMs / 16.67) * state.speed);

  const initials = name => name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const timeString = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  /** Scramble text from its current value to `to`. Resolves when done. */
  function scramble(el, to, sc, duration = 600) {
    const glyphs = 'abcdefghijklmnopqrstuvwxyz';
    const from = el.textContent;
    const len = Math.max(from.length, to.length);
    const start = performance.now();
    return new Promise(resolve => {
      const stop = sc.frame(now => {
        const p = clamp((now - start) / duration, 0, 1);
        let out = '';
        for (let i = 0; i < len; i++) {
          const settleAt = i / len;
          if (p >= settleAt * 0.7 + 0.3) out += to[i] || '';
          else if (to[i] === ' ') out += ' ';
          else out += glyphs[(Math.random() * glyphs.length) | 0];
        }
        el.textContent = out;
        if (p === 1) { el.textContent = to; stop(); resolve(); }
      });
    });
  }

  /* Placeholder projects shared by every work layout. Replace with real ones.
     weight: 3 = flagship, 2 = notable, 1 = smaller piece. aspect: media height / width.
     mix: share of [design, research, code] in the project (used by the roles map). */
  const PROJECTS = [
    { id: 'p1',  title: 'Project One',    type: 'Case study',    year: 2026, role: 'Lead designer',    tags: ['Product', 'Systems'],   impact: '+32% activation',    weight: 3, hue: 215, aspect: 0.75, mix: [0.6, 0.25, 0.15], glyph: '◐', blurb: 'Turned a sprawling workflow into three calm steps.' },
    { id: 'p2',  title: 'Project Two',    type: 'Design system', year: 2025, role: 'Design engineer',  tags: ['Systems', 'Code'],     impact: '4 products, 1 system', weight: 3, hue: 300, aspect: 1.2, mix: [0.4, 0.1, 0.5], glyph: '◆', blurb: 'One shared language for four products and two platforms.' },
    { id: 'p3',  title: 'Project Three',  type: 'Prototype',     year: 2025, role: 'Prototyper',       tags: ['Motion', 'Code'],      impact: 'Shipped in 6 weeks',  weight: 2, hue: 25,  aspect: 0.9, mix: [0.35, 0.05, 0.6], glyph: '✦', blurb: 'A high-fidelity prototype that became the real thing.' },
    { id: 'p4',  title: 'Project Four',   type: 'Research',      year: 2024, role: 'Researcher',       tags: ['Research', 'Product'], impact: '30 interviews',       weight: 2, hue: 160, aspect: 1.4, mix: [0.2, 0.75, 0.05], glyph: '⌕', blurb: 'What thirty customers taught us about trust.' },
    { id: 'p5',  title: 'Project Five',   type: 'Exploration',   year: 2024, role: 'Designer',         tags: ['Visual', 'Motion'],    impact: 'Award shortlist',     weight: 1, hue: 50,  aspect: 0.8, mix: [0.85, 0.1, 0.05], glyph: '✺', blurb: 'A visual language study for a product that does not exist yet.' },
    { id: 'p6',  title: 'Project Six',    type: 'Side project',  year: 2023, role: 'Maker',            tags: ['Code', 'Tool'],        impact: '2k users',            weight: 1, hue: 190, aspect: 1.1, mix: [0.15, 0.05, 0.8], glyph: '⚙', blurb: 'A tiny tool I built for myself that other people adopted.' },
    { id: 'p7',  title: 'Project Seven',  type: 'Case study',    year: 2023, role: 'Lead designer',    tags: ['Product', 'Mobile'],   impact: '4.8 store rating',    weight: 2, hue: 340, aspect: 0.7, mix: [0.55, 0.3, 0.15], glyph: '◉', blurb: 'Rebuilding a mobile app around one daily habit.' },
    { id: 'p8',  title: 'Project Eight',  type: 'Writing',       year: 2022, role: 'Author',           tags: ['Writing'],             impact: '40k readers',         weight: 1, hue: 260, aspect: 1.3, mix: [0.3, 0.5, 0.2], glyph: '✎', blurb: 'An essay on designing for calm in noisy software.' },
    { id: 'p9',  title: 'Project Nine',   type: 'Talk',          year: 2022, role: 'Speaker',          tags: ['Speaking', 'Systems'], impact: '3 conferences',       weight: 1, hue: 120, aspect: 0.85, mix: [0.4, 0.3, 0.3], glyph: '☰', blurb: 'A talk about design systems that grow up with a team.' },
    { id: 'p10', title: 'Project Ten',    type: 'Case study',    year: 2021, role: 'Product designer', tags: ['Product', 'Data'],     impact: '−40% support tickets', weight: 2, hue: 80,  aspect: 1.0, mix: [0.5, 0.3, 0.2], glyph: '▦', blurb: 'Making a data-heavy admin tool feel obvious.' },
    { id: 'p11', title: 'Project Eleven', type: 'Workshop',      year: 2020, role: 'Facilitator',      tags: ['Research', 'Teaching'], impact: '12 teams trained',   weight: 1, hue: 10,  aspect: 1.25, mix: [0.25, 0.45, 0.3], glyph: '❖', blurb: 'A hands-on workshop on prototyping in code.' },
    { id: 'p12', title: 'Project Twelve', type: 'Identity',      year: 2019, role: 'Designer',         tags: ['Visual', 'Brand'],     impact: 'Still in use',        weight: 1, hue: 230, aspect: 0.95, mix: [0.9, 0.05, 0.05], glyph: '❋', blurb: 'An identity for a small studio, built to flex.' },
  ];

  const NAV = [
    { id: 'work',    label: 'Work' },
    { id: 'about',   label: 'About' },
    { id: 'resume',  label: 'Resume' },
    { id: 'contact', label: 'Contact' },
  ];

  window.Lab = {
    TYPES, PRESETS, EASINGS, TABS, NAV, DEFAULTS, PROJECTS,
    get state() { return state; },
    set, motion, resolvedTheme, applyRoot,
    subscribe: fn => (listeners.add(fn), () => listeners.delete(fn)),
    register, registry, scope,
    esc, clamp, lerp, damp, initials, timeString, scramble,
    reducedQuery,
  };

  applyRoot();
})();
