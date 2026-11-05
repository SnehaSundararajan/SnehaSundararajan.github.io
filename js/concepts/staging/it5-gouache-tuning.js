/* Staging, iteration 05: Gouache tuning.
   Iteration 04 (locked) with three groups of levers in the control panel:
   dark palette and name type, sticker depth (hard offset and soft shadow), two
   very diffused color blobs glowing behind the desk, and the X-ray circle (on or
   off, circle and dot size). Choices persist in localStorage and ride along with
   Copy settings; Save glow keeps the glow as a preset you can recall.
   Iteration 06 is the signed-off result: the same desk with LOCKED settings
   and no levers. */

(function () {
  const KEY = 'hugo-lab:it5';
  const GLOW_KEY = 'hugo-lab:it5:glow';
  const PALETTES = [['onyx', 'Onyx'], ['graphite', 'Graphite'], ['midnight', 'Midnight'], ['stone', 'Stone'], ['accent', 'One accent'], ['original', 'Original']];
  const GLOW_KEYS = ['glow', 'pos', 'ax', 'ay', 'bx', 'by', 'strength', 'size', 'blur', 'drift'];

  // Blob centers as % of the stage: [a x, a y, b x, b y].
  const POSITIONS = {
    diagonal: [14, 16, 86, 88],
    reverse:  [86, 14, 14, 86],
    name:     [24, 26, 78, 70],
    sides:    [2, 50, 98, 50],
    bottom:   [26, 100, 74, 100],
  };

  const DEFAULTS = {
    palette: 'onyx', type: 'dm', mouse: 'on', circle: 80, dot: 8,
    depth: 'offset', ink: 'black', offset: 3, shadow: 30,
    glow: 'orbs', pos: 'diagonal', ax: 14, ay: 16, bx: 86, by: 88, strength: 35, size: 55, blur: 110, drift: 'on',
  };
  const set = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  // Retired palettes (the bright and the colorful dark sets) fall back to Onyx.
  if (!PALETTES.some(([id]) => id === set.palette)) set.palette = 'onyx';
  // Tinted (from the name color) read too reddish; it became Slate.
  if (set.ink === 'tinted') set.ink = 'slate';

  // Signed off 2026-10-28 from Copy settings (iteration 06). Original palette shows the Paper brand through.
  const LOCKED = {
    palette: 'original', type: 'dm', mouse: 'on', circle: 100, dot: 11,
    depth: 'both', ink: 'light', offset: 2, shadow: 34,
    glow: 'aurora', pos: 'custom', ax: 24, ay: 34, bx: 70, by: 72, strength: 10, size: 73, blur: 102, drift: 'on',
  };

  /** The tuned desk: iteration 04 plus palette, depth, glow, and circle size from `s`. Returns apply() to re-read `s`. */
  function mountDesk(root, api, s) {
    DeskStyles.mount(root, api, 'gouache', { reveal: 'sketch', locked: true, radius: () => (s.mouse === 'on' ? s.circle : 0) });
    const box = root.querySelector('.ds');
    box.classList.add('g5');
    root.querySelector('.ds-top').insertAdjacentHTML('afterbegin',
      '<div class="g5-glow" aria-hidden="true"><i class="g5-blob is-a"></i><i class="g5-blob is-b"></i></div>');

    const apply = () => {
      Object.assign(box.dataset, { palette: s.palette, type: s.type, depth: s.depth, ink: s.ink, glow: s.glow });
      box.dataset.drift = s.drift === 'on' && api.motion().types.ambient ? 'on' : 'off';
      const v = {
        '--off': `${s.offset}px`,
        '--sh-y': `${(2 + s.shadow * 0.14).toFixed(1)}px`,
        '--sh-b': `${(4 + s.shadow * 0.24).toFixed(1)}px`,
        '--sh-a': (s.shadow / 100 * 0.45).toFixed(3),
        '--ax': `${s.ax}%`, '--ay': `${s.ay}%`, '--bx': `${s.bx}%`, '--by': `${s.by}%`,
        '--glow-o': (s.strength / 100).toFixed(2),
        '--glow-size': `${s.size}%`,
        '--glow-blur': `${s.blur}px`,
        '--dot': `${s.dot}px`,
      };
      Object.entries(v).forEach(([k, x]) => box.style.setProperty(k, x));
      // Mouse effects off: the circle and dot shrink away and the native cursor returns.
      root.classList.toggle('is-cursor-owned', s.mouse === 'on');
    };
    apply();
    return apply;
  }

  const it4 = Lab.registry.staging.find(c => c.id === 'it4');

  Lab.register('staging', {
    id: 'it5',
    family: 'Iterations',
    title: '05 · Gouache tuning',
    oneLiner: 'Iteration 04 on a near-black, near-neutral desk, with levers for palette, sticker depth, a soft two-color glow, and the X-ray circle. Motion and wobble match the locked version.',
    levers: ['ambient', 'hover'],
    ownsCursor: true,
    how: 'Tune palette, sticker depth, glow, and the X-ray circle below. Palette replaces the Branding panel colors (Original shows them through). Position presets set the four glow sliders; drag any slider to fine-tune. Save glow keeps the current glow; Mine brings it back.',
    // Same signed-off motion settings as iteration 04, so the two compare one to one.
    snapshot: it4.snapshot,
    settings: () => ({ ...set }),
    inspiration: [
      { name: 'Iteration 04', url: '#', borrow: 'the whole desk, unchanged underneath' },
      { name: 'Linear, Vercel dark UI', url: 'https://linear.app', borrow: 'near-black surfaces, near-neutral tones, one quiet accent' },
      { name: 'Neo-brutalist stickers', url: '#', borrow: 'a hard black offset for depth without blur' },
    ],
    readability: [
      'Sticker fills stay light (L 80% or more) so the dark labels keep AA contrast',
      'The name is off-white on near-black paper, far above AA',
      'The glow sits behind everything at low opacity and never under body text at full strength',
      'Drift follows the Ambient lever and stops with reduced motion',
    ],

    mount(root, api) {
      const apply = mountDesk(root, api, set);

      const pct = { range: [0, 100], unit: '%' };
      const groups = [
        { heading: 'Palette' },
        { id: 'palette', label: 'Colors', value: set.palette, values: PALETTES },
        { id: 'type', label: 'Name type', value: set.type, values: [['dm', 'DM Sans'], ['fraunces', 'Fraunces'], ['recursive', 'Recursive'], ['grotesk', 'Grotesk'], ['serif', 'Serif']] },
        { heading: 'Sticker depth' },
        { id: 'depth', label: 'Style', value: set.depth, values: [['none', 'Flat'], ['offset', 'Offset'], ['shadow', 'Shadow'], ['both', 'Both']] },
        { id: 'ink', label: 'Offset color', value: set.ink, values: [['black', 'Black'], ['slate', 'Slate'], ['glow', 'Glow'], ['light', 'Light']] },
        { id: 'offset', label: 'Offset', value: set.offset, range: [1, 8], unit: 'px' },
        { id: 'shadow', label: 'Shadow', value: set.shadow, ...pct },
        { heading: 'Background glow' },
        { id: 'glow', label: 'Kind', value: set.glow, values: [['none', 'Off'], ['orbs', 'Orbs'], ['aurora', 'Aurora'], ['halo', 'Halo']] },
        { id: 'pos', label: 'Position', value: set.pos, values: [['diagonal', '↘'], ['reverse', '↙'], ['name', 'Name'], ['sides', 'Sides'], ['bottom', 'Bottom']] },
        { id: 'ax', label: 'Blob A across', value: set.ax, ...pct },
        { id: 'ay', label: 'Blob A down', value: set.ay, ...pct },
        { id: 'bx', label: 'Blob B across', value: set.bx, ...pct },
        { id: 'by', label: 'Blob B down', value: set.by, ...pct },
        { id: 'strength', label: 'Strength', value: set.strength, ...pct },
        { id: 'size', label: 'Size', value: set.size, range: [20, 100], unit: '%' },
        { id: 'blur', label: 'Diffusion', value: set.blur, range: [20, 220], unit: 'px' },
        { id: 'drift', label: 'Drift', value: set.drift, values: [['on', 'On'], ['off', 'Off']] },
        { id: 'glowPreset', label: 'Glow preset', value: null, values: [['mine', 'Mine'], ['save', 'Save glow']] },
        { heading: 'Mouse effects' },
        { id: 'mouse', label: 'X-ray circle', value: set.mouse, values: [['on', 'On'], ['off', 'Off']] },
        { id: 'circle', label: 'Big circle', value: set.circle, range: [30, 200], unit: 'px' },
        { id: 'dot', label: 'Small dot', value: set.dot, range: [0, 24], unit: 'px' },
      ];

      // Brings every switch and slider in line with `set` (after a preset loads).
      const syncBar = () => groups.forEach(g => {
        if (!g.id || g.id === 'glowPreset') return;
        g.value = set[g.id];
        if (g.range) {
          const input = bar.querySelector(`[data-range="${g.id}"]`);
          input.value = g.value;
          input.previousElementSibling.querySelector('output').textContent = `${g.value}${g.unit || ''}`;
        } else {
          bar.querySelectorAll(`[data-group="${g.id}"] button`).forEach(b => b.setAttribute('aria-checked', String(b.dataset.value === String(g.value))));
        }
      });

      const bar = Kit.options(root, api.scope, groups, (id, v) => {
        if (id === 'glowPreset') {
          bar.querySelectorAll('[data-group="glowPreset"] button').forEach(b => b.setAttribute('aria-checked', 'false'));
          if (v === 'save') {
            localStorage.setItem(GLOW_KEY, JSON.stringify(Object.fromEntries(GLOW_KEYS.map(k => [k, set[k]]))));
            api.toast('Glow saved as Mine');
            return;
          }
          const mine = localStorage.getItem(GLOW_KEY);
          if (!mine) return api.toast('No saved glow yet: tune it, then Save glow');
          Object.assign(set, JSON.parse(mine));
          syncBar();
          api.toast('Glow preset Mine applied');
        } else if (id === 'pos') {
          // A preset moves the four position sliders with it.
          set.pos = v;
          ['ax', 'ay', 'bx', 'by'].forEach((k, i) => { set[k] = POSITIONS[v][i]; });
          syncBar();
        } else if (['ax', 'ay', 'bx', 'by'].includes(id)) {
          set[id] = v;
          set.pos = 'custom';
          bar.querySelectorAll('[data-group="pos"] button').forEach(b => b.setAttribute('aria-checked', 'false'));
        } else {
          set[id] = v;
        }
        localStorage.setItem(KEY, JSON.stringify(set));
        apply();
      }, 'bottom');
      bar.classList.add('ds-opts');
    },
  });

  Lab.register('staging', {
    id: 'it6',
    family: 'Iterations',
    title: '06 · Gouache minimal (locked)',
    oneLiner: 'Iteration 05 as signed off: Original palette on Paper, stickers with a light 2px offset plus a soft shadow, a faint aurora glow, and a 100px X-ray circle with an 11px dot. Settings are locked.',
    levers: ['ambient', 'hover'],
    ownsCursor: true,
    how: 'Drag and toss any sticker. The circle shows the pencil sketch underneath. Click the turntable to play a song. Experiment in 05 instead.',
    // Motion levers as in 04, plus the Paper brand, since the Original palette shows its colors through.
    snapshot: { ...it4.snapshot, brand: 'paper' },
    settings: () => ({ ...LOCKED }),
    inspiration: [
      { name: 'Iteration 05', url: '#', borrow: 'every setting, frozen' },
      { name: 'Iteration 04', url: '#', borrow: 'the desk, motion, and wobble' },
    ],
    readability: [
      'Same palette and labels as 04, so contrast is unchanged',
      'The glow is at 10% strength: depth without color noise',
      'The light offset is 2px, enough to lift a sticker without outlining it',
      'Drift follows the Ambient lever and stops with reduced motion',
    ],

    mount(root, api) {
      mountDesk(root, api, LOCKED);
    },
  });
})();
