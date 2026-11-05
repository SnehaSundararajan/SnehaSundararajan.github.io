/* Staging, iteration 04: Gouache. Locked.
   The Desk styles Gouache look with the settings you signed off on: motion
   levers, desk style sliders, and the circle showing the pencil sketch.
   Selecting it restores all of them; the switchers are hidden so the
   iteration stays as approved. Experiment in Desk styles instead. */

Lab.register('staging', {
  id: 'it4',
  family: 'Iterations',
  title: '04 · Gouache (locked)',
  oneLiner: 'The Gouache desk with your saved settings: muted earth palette, readable DM Sans labels, calm motion (16%, linear), hover on, no entrance. Drag, toss, tidy, and the circle shows the pencil sketch. Settings are locked.',
  levers: ['ambient', 'hover'],
  ownsCursor: true,
  how: 'Drag and toss any sticker. The circle shows what is underneath. Click the turntable to play a song.',
  // Captured from the lab's "Copy settings" on the Gouache desk style.
  snapshot: {
    preset: 'custom',
    intensity: 0.16,
    speed: 1,
    easing: 'linear',
    types: { entrance: false, ambient: true, cursor: false, hover: true, text: false, customCursor: false },
    accentHue: 239,
    texture: false,
    deskStyle: { wobble: 0.5, textWobble: 0.12, weight: 600 },
  },
  inspiration: [
    { name: 'Desk styles: Gouache', url: '#', borrow: 'the look, palette, and readable labels' },
    { name: 'Iteration 03', url: '#', borrow: 'drag, toss, tidy, and the reveal circle' },
    { name: 'Mid-century illustration', url: 'https://en.wikipedia.org/wiki/Gouache', borrow: 'flat matte paint, slightly wobbly edges' },
  ],
  readability: [
    'Labels in a sturdy sans with very low text wobble',
    'Muted fills keep dark labels high contrast',
    'Motion is calm: low intensity, linear easing, no entrance',
    'The circle shows the pencil underdrawing, never pops in and out',
  ],

  mount(root, api) {
    DeskStyles.mount(root, api, 'gouache', { reveal: 'sketch', locked: true });
  },
});
