/* About me in the Gouache style. The copy is Sneha's own (BLOCK); facts and answers are drawn from it. */

(function () {
  // The About copy, as short paragraphs. <b> marks phrases a version can highlight.
  const BLOCK = [
    "Hi, I'm Sneha. I'm currently helping bring a first-class <b>Certificate Management</b> experience to Quantum Administrators and Firewall Administrators at <b>Palo Alto Networks</b>.",
    "I also spend time helping develop user experience guardrails within automated software production workflows and spend time thinking about <b>usable safety guardrails in the age of AI</b>. Reach out to me if you're interested in our latest research!",
    "I graduated from <b>IIT Roorkee</b> in 2024 with a Bachelor's in Electronics and Communication Engineering. While rooted in a technical foundation, my <b>six internships</b> allowed me to apply diverse HCI research methodologies across complex domains. This experience helped me lead architecturally nuanced 'Better Together' product initiatives through two consecutive mergers over the past two years.",
    'Apart from work and research, I like to <b>read, sketch, drink tea</b>, build community, and hit the beach.',
  ];
  const plain = h => h.replace(/<\/?b>/g, '');
  const ABOUT = {
    hello: "Hi, I'm Sneha.",
    lead: plain(BLOCK[0]).replace("Hi, I'm Sneha. ", ''),
    bio: BLOCK.slice(1).map(plain),
    facts: [
      ['Now', 'Design @ Palo Alto Networks'],
      ['I am a', 'designer · researcher · builder'],
      ['Studied', "Electronics and Communication Engineering, IIT Roorkee ('24)"],
      ['Off screen', 'Reading, sketching, tea, community, and the beach'],
    ],
    qa: [
      ['What do you do?', plain(BLOCK[0]).replace("Hi, I'm Sneha. ", '')],
      ['What else are you working on?', plain(BLOCK[1])],
      ['How did you get here?', plain(BLOCK[2])],
      ['What do you do for fun?', plain(BLOCK[3])],
    ],
  };
  const SNAPSHOT = { preset: 'custom', intensity: 0.16, speed: 1, easing: 'linear', types: { entrance: false, ambient: true, cursor: false, hover: true, text: false, customCursor: false }, accentHue: 239, texture: false };
  const CUP = '<svg viewBox="0 0 48 44" aria-hidden="true"><path d="M8 18h26v8a11 11 0 0 1-11 11h-4A11 11 0 0 1 8 26Z"/><path d="M34 21h3a5 5 0 0 1 0 10h-4"/><path d="M5 40h34"/><path d="M16 4c-2 3 2 5 0 8M23 3c-2 3 2 5 0 8M30 4c-2 3 2 5 0 8"/></svg>';
  const HOME = `<button class="gwx-home" data-go="home" aria-label="Home" title="Home">${CUP}</button>`;
  const PHOTO = () => Staging.IMAGES.portrait;
  const facts = () => `<dl class="ga-facts">${ABOUT.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${Lab.esc(v)}</dd></div>`).join('')}</dl>`;
  const links = c => `<p class="ga-links"><a href="${c.linkedin}" target="_blank" rel="noopener">LinkedIn</a><button type="button" data-go="email">Copy email</button><a href="https://medium.com/@sneha_s" target="_blank" rel="noopener">Medium</a></p>`;

  const R = (id, title, oneLiner, mount, how) => Lab.register('about', {
    id, title, oneLiner, levers: ['hover'], deskControls: true, snapshot: SNAPSHOT, how,
    inspiration: [{ name: 'The site so far', url: '#', borrow: 'the gouache paper, rust type, and stickers' }],
    readability: ['Bio at a comfortable reading width', 'Facts are short and scannable', 'Links to LinkedIn, email, and Medium at the end'],
    mount,
  });

  /* 1. Editorial portrait */
  R('portrait', 'Editorial portrait', 'Your polaroid beside a large opening line, then a short bio and a quiet list of facts. Classic and calm.',
    (root, { scope: sc, content: c }) => {
      Gouache.frame(root, sc, 'ga ga-portrait', `
        <div class="ga-top">${HOME}</div>
        <div class="ga-grid">
          <figure class="ga-polaroid"><img src="${PHOTO()}" alt="Sneha Sundar" referrerpolicy="no-referrer"></figure>
          <div class="ga-text">
            <h2 class="gw-title">${ABOUT.hello}</h2>
            <p class="ga-lead">${Lab.esc(ABOUT.lead)}</p>
            ${ABOUT.bio.map(p => `<p>${Lab.esc(p)}</p>`).join('')}
            ${facts()}
            ${links(c)}
          </div>
        </div>`);
    }, 'The tea cup goes home. Links at the end copy your email or open LinkedIn and Medium.');

  /* 2. Letter */
  R('letter', 'Letter', 'A short note on paper in your own voice, signed off, with the octopus and the tea cup drawn in the margins.',
    (root, { scope: sc, content: c }) => {
      Gouache.frame(root, sc, 'ga ga-letter', `
        <div class="ga-top">${HOME}</div>
        <article class="ga-paper">
          <img class="ga-margin is-octopus" src="${Staging.IMAGES.octopus}" alt="" referrerpolicy="no-referrer">
          <span class="ga-margin is-cup" aria-hidden="true">${CUP}</span>
          <p class="ga-dear">Hi there,</p>
          <p class="ga-lead">${Lab.esc(ABOUT.lead)}</p>
          ${ABOUT.bio.map(p => `<p>${Lab.esc(p)}</p>`).join('')}
          ${links(c)}
        </article>`);
    }, 'Read the note; the links at the bottom copy your email or open LinkedIn and Medium.');

  /* 3. Sticker facts */
  R('stickers', 'Sticker facts', 'The desk stickers come back: point at one and its fact appears in the panel beside them. Playful, and it ties About to the home page.',
    (root, { scope: sc, content: c }) => {
      const items = [
        ['photo', 'sticker-photo', ABOUT.hello, ABOUT.lead],
        ['tape', 'sticker-tape', 'Now', 'Design @ Palo Alto Networks.'],
        ['cup', 'sticker-cup', 'Fuel', 'Tea, always.'],
        ['octopus', 'sticker-octopus', 'Hands', 'I draw, sometimes. The octopus is mine.'],
        ['turntable', 'sticker-turntable', 'On repeat', 'Peter Cat Recording Co., Floated By especially.'],
        ['roles', 'sticker-roles', 'Three hats', 'designer · researcher · builder'],
      ];
      const sticker = ([k]) => ({
        photo: Kit.sticker({ shape: 'photo', color: '#fff', img: PHOTO() }),
        tape: Kit.sticker({ shape: 'tape', label: 'Design @ Palo Alto Networks', color: 'var(--pop-orange)' }),
        cup: Kit.sticker({ shape: 'cup', color: 'var(--pop-mint)' }),
        octopus: Kit.sticker({ shape: 'cutout', color: 'none', img: Staging.IMAGES.octopus }),
        turntable: Kit.sticker({ shape: 'turntable', color: 'oklch(82% 0.025 75)' }),
        roles: Kit.sticker({ shape: 'circle', label: 'three hats', color: 'var(--pop-yellow)' }),
      })[k];
      const box = Gouache.frame(root, sc, 'ga ga-stickers', `
        <div class="ga-top">${HOME}</div>
        <div class="ga-sgrid">
          <div class="ga-board ds-style-gouache">${items.map((it, i) => `<button class="ga-st ${it[1]}" data-i="${i}" aria-label="${Lab.esc(it[2])}">${sticker(it)}</button>`).join('')}</div>
          <aside class="ga-fact" aria-live="polite"></aside>
        </div>`);
      const fact = box.querySelector('.ga-fact');
      const show = i => {
        const [, , h, t] = items[i];
        box.querySelectorAll('.ga-st').forEach((b, k) => b.classList.toggle('is-on', k === i));
        fact.innerHTML = `<p class="ga-k">${Lab.esc(h)}</p><p class="ga-v">${Lab.esc(t)}</p>${i === 0 ? ABOUT.bio.slice(0, 1).map(p => `<p>${Lab.esc(p)}</p>`).join('') : ''}${links(c)}`;
      };
      show(0);
      const pick = e => { const b = e.target.closest('.ga-st'); if (b) show(Number(b.dataset.i)); };
      sc.on(box, 'pointerover', pick); sc.on(box, 'focusin', pick); sc.on(box, 'click', pick);
    }, 'Point at (or tap) a sticker to read its fact.');

  /* 4. Q&A */
  R('qa', 'Q&A', 'Questions people ask you, set large in your rust lettering. Click one and the answer opens underneath.',
    (root, { scope: sc, content: c }) => {
      const box = Gouache.frame(root, sc, 'ga ga-qa', `
        <div class="ga-top">${HOME}<h2 class="ga-hello">${ABOUT.hello}</h2></div>
        <div class="ga-qlist">${ABOUT.qa.map(([q, a], i) => `
          <div class="ga-q${i ? '' : ' is-open'}">
            <button class="ga-qbtn" aria-expanded="${!i}"><span class="m-num">${String(i + 1).padStart(2, '0')}</span><span class="ga-qt">${Lab.esc(q)}</span></button>
            <div class="ga-ans"><div><p>${Lab.esc(a)}</p></div></div>
          </div>`).join('')}</div>
        ${links(c)}`);
      sc.on(box, 'click', e => {
        const b = e.target.closest('.ga-qbtn');
        if (!b) return;
        box.querySelectorAll('.ga-q').forEach(q => { const open = q.contains(b) && !q.classList.contains('is-open'); q.classList.toggle('is-open', open); q.querySelector('.ga-qbtn').setAttribute('aria-expanded', String(open)); });
      });
    }, 'Click a question to open its answer.');

  /* ================= v2: versions for a block of text ================= */

  /* 5. Big read */
  R('bigread', 'Big read', 'One generous paragraph in large type, with a few key phrases picked out by a painted stroke. Nothing else competes with the words.',
    (root, { scope: sc, content: c }) => {
      Gouache.frame(root, sc, 'ga ga-big', `
        <div class="ga-top">${HOME}</div>
        <div class="ga-bigtext">${BLOCK.map(p => `<p>${p.replace(/<b>/g, '<mark>').replace(/<\/b>/g, '</mark>')}</p>`).join('')}</div>
        ${links(c)}`);
    }, 'Read; the links at the end copy your email or open LinkedIn and Medium.');

  /* 6. Margin notes */
  R('margin', 'Margin notes', 'A centered column of text with small handwritten notes in the margin, each beside the line it talks about. Like reading your annotated draft.',
    (root, { scope: sc, content: c }) => {
      const NOTES = ['right now', 'ask me about it', 'the path here', 'tea, always'];
      Gouache.frame(root, sc, 'ga ga-margin', `
        <div class="ga-top">${HOME}</div>
        <article class="ga-col">
          <h2 class="gw-title">About</h2>
          ${BLOCK.map((p, i) => `<div class="ga-mrow"><p>${plain(p)}</p>${NOTES[i] ? `<em class="ga-note${i % 2 ? ' is-left' : ''}">${NOTES[i]}</em>` : ''}</div>`).join('')}
          ${links(c)}
        </article>`);
    }, 'Read the column; the notes in the margin are asides.');

  /* 7. Postcard */
  R('postcard', 'Postcard', 'The text sits on the left of a postcard; the octopus is the stamp and your details sit where the address would go.',
    (root, { scope: sc, content: c }) => {
      Gouache.frame(root, sc, 'ga ga-post', `
        <div class="ga-top">${HOME}</div>
        <article class="ga-card">
          <div class="ga-card-msg">${BLOCK.map(p => `<p>${plain(p)}</p>`).join('')}</div>
          <div class="ga-card-addr">
            <div class="ga-stamp"><img src="${Staging.IMAGES.octopus}" alt="" referrerpolicy="no-referrer"></div>
            <p class="ga-addr-line">Sneha Sundar</p>
            <p class="ga-addr-line">designer · researcher · builder</p>
            <p class="ga-addr-line">Design @ Palo Alto Networks</p>
            ${links(c)}
          </div>
        </article>`);
    }, 'Read the card; the links on the right copy your email or open LinkedIn and Medium.');

  /* 8. Magazine */
  R('magazine', 'Magazine', 'A large painted drop cap, two text columns on wide screens, and one pull quote. Editorial and composed.',
    (root, { scope: sc, content: c }) => {
      Gouache.frame(root, sc, 'ga ga-mag', `
        <div class="ga-top">${HOME}</div>
        <header class="ga-mag-head"><p class="ga-kick">About</p><h2 class="gw-title">Sneha Sundar</h2></header>
        <div class="ga-mag-cols">
          <p class="ga-drop">${plain(BLOCK[0])}</p>
          <p>${plain(BLOCK[1])}</p>
          <blockquote class="ga-pull">Ask the right questions, find the right users, track the right metrics.</blockquote>
          <p>${plain(BLOCK[2])}</p>
          <p>${plain(BLOCK[3])}</p>
        </div>
        ${links(c)}`);
    }, 'Read the columns; the links at the end copy your email or open LinkedIn and Medium.');

  /* ================= v3: Postcard with a dress-up game on the right ================= */
  // A drawn doll (not a photo) so every prop fits. Props are drawn in a 60 x 60 box centred on 30,30;
  // each slot says where that box lands on the doll (x, y) and how big (s). Two outfits for now.
  const INK = '#2a2620';
  const SLOTS = { head: { x: 110, y: 40, s: 1.5, label: 'Head' }, face: { x: 110, y: 84, s: 1.2, label: 'Face' }, left: { x: 50, y: 190, s: 0.9, label: 'Left hand' }, right: { x: 170, y: 190, s: 0.9, label: 'Right hand' } };
  const PROPS = {
    beret:  { slot: 'head',  name: 'Beret',       word: 'arty',     art: `<ellipse cx="30" cy="36" rx="26" ry="10" fill="#b5543c"/><path d="M8 37q22-16 44 0" fill="#c8664b"/><path d="M30 25l2-7" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` },
    hat:    { slot: 'head',  name: 'Party hat',   word: 'party',    art: `<path d="M14 42L30 0l16 42z" fill="#e6b84a" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M19 30l18-9M22 40l20-10" stroke="#d0603f" stroke-width="3"/><circle cx="30" cy="0" r="5" fill="#d0603f"/>` },
    specs:  { slot: 'face',  name: 'Round specs', word: 'curious',  art: `<g fill="none" stroke="${INK}" stroke-width="2.5"><circle cx="16" cy="30" r="9"/><circle cx="44" cy="30" r="9"/><path d="M25 29q5-3 10 0M7 28l-5-2M53 28l5-2"/></g>` },
    tache:  { slot: 'face',  name: 'Moustache',   word: 'dapper',   art: `<path d="M30 42c-4-4-10-6-16-3-4 2-7 1-9-2 1 6 6 9 12 8 6 0 10-2 13-3 3 1 7 3 13 3 6 1 11-2 12-8-2 3-5 4-9 2-6-3-12-1-16 3z" fill="${INK}"/>` },
    tea:    { slot: 'left',  name: 'Tea',         word: 'tea break', art: `<path d="M16 24h24v8a10 10 0 0 1-10 10h-4a10 10 0 0 1-10-10z" fill="#f3ede2" stroke="${INK}" stroke-width="2.5"/><path d="M40 27h3a4 4 0 0 1 0 8h-3" fill="none" stroke="${INK}" stroke-width="2.5"/><path d="M24 18c-2-3 2-5 0-8M32 18c-2-3 2-5 0-8" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>` },
    record: { slot: 'left',  name: 'Record',      word: 'DJ set',   art: `<circle cx="30" cy="22" r="20" fill="${INK}"/><circle cx="30" cy="22" r="14" fill="none" stroke="#4a443b" stroke-width="1.5"/><circle cx="30" cy="22" r="7" fill="#d0603f"/><circle cx="30" cy="22" r="1.6" fill="#f3ede2"/>` },
    glass:  { slot: 'right', name: 'Magnifier',   word: 'research', art: `<path d="M33 31l10 13" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="24" cy="20" r="12" fill="#cfe3e6" fill-opacity="0.7" stroke="${INK}" stroke-width="3"/>` },
    balloon:{ slot: 'right', name: 'Balloon',     word: 'party',    art: `<path d="M30 14q-3 7 2 14t-2 14" fill="none" stroke="${INK}" stroke-width="1.5"/><ellipse cx="30" cy="-4" rx="14" ry="18" fill="#6f9fc8" stroke="${INK}" stroke-width="2"/><path d="M28 14l2-4 2 4z" fill="#6f9fc8" stroke="${INK}" stroke-width="1.5"/>` },
  };
  const OUTFITS = [
    { id: 'studio', name: 'Studio day', note: 'Tea in one hand, questions in the other.', props: ['beret', 'specs', 'tea', 'glass'] },
    { id: 'party',  name: 'Party mode', note: 'Records on, hat on.', props: ['hat', 'tache', 'record', 'balloon'] },
  ];
  const DOLL = `
    <g class="dz-doll" filter="url(#gw-brush)">
      <path d="M95 250v24M125 250v24" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <path d="M74 140L50 198M146 140L170 198" stroke="#e2b494" stroke-width="10" stroke-linecap="round"/>
      <path d="M92 124h36l26 126H66z" fill="#7d9a7a" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M92 124q18 14 36 0" fill="none" stroke="${INK}" stroke-width="2"/>
      <circle cx="50" cy="200" r="7" fill="#e2b494"/><circle cx="170" cy="200" r="7" fill="#e2b494"/>
      <rect x="102" y="112" width="16" height="16" rx="4" fill="#e2b494"/>
      <path d="M64 92c-4-34 14-56 46-56s50 22 46 56c-2 14-6 22-8 28h-76c-2-6-6-14-8-28z" fill="#3b2a22"/>
      <circle cx="110" cy="82" r="38" fill="#e8bc9c"/>
      <path d="M72 78c6-26 24-36 40-36 18 0 32 12 36 30-14-4-30-12-38-24-6 14-20 24-38 30z" fill="#3b2a22"/>
      <circle cx="96" cy="84" r="3.4" fill="${INK}"/><circle cx="124" cy="84" r="3.4" fill="${INK}"/>
      <circle cx="88" cy="96" r="6" fill="#e59a86" opacity="0.55"/><circle cx="132" cy="96" r="6" fill="#e59a86" opacity="0.55"/>
      <path d="M102 100q8 7 16 0" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
    </g>`;
  const place = (id, x, y, rot = 0) => { const P = PROPS[id], s = SLOTS[P.slot].s; return `<g class="dz-prop" data-p="${id}" transform="translate(${x} ${y}) rotate(${rot}) scale(${s}) translate(-30 -30)">${P.art}</g>`; };
  const onSlot = id => { const { x, y } = SLOTS[PROPS[id].slot]; return place(id, x, y); };
  const icon = id => `<svg viewBox="-6 -26 72 74" aria-hidden="true">${PROPS[id].art}</svg>`;
  const stage = () => `<svg class="dz-stage" viewBox="0 -24 220 304" role="img" aria-label="A drawn doll to dress up">${DOLL}<g class="dz-worn"></g></svg>`;
  // The postcard: the message and the links on the left, the game on the right.
  const postcard = (sc, root, c, cls, game) => Gouache.frame(root, sc, `ga ga-post ga-dress ${cls}`, `
    <div class="ga-top">${HOME}</div>
    <article class="ga-card">
      <div class="ga-card-msg">${BLOCK.map(p => `<p>${plain(p)}</p>`).join('')}${iconLinks(c)}</div>
      <div class="ga-card-addr dz">${game}</div>
    </article>`);
  // Copy email, LinkedIn, and Medium as plain icons under the message.
  const iconLinks = c => `<p class="ga-icons">
    <button type="button" data-go="email" aria-label="Copy email" title="Copy email"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M3.5 6.5 12 13l8.5-6.5"/></svg></button>
    <a href="${c.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn" title="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="4"/><path d="M7.5 10.5v6M7.5 7.4v.1M11.5 16.5v-6M11.5 13.2c0-1.6 1-2.7 2.5-2.7s2.5 1 2.5 2.7v3.3"/></svg></a>
    <a href="https://medium.com/@sneha_s" target="_blank" rel="noopener" aria-label="Medium" title="Medium"><svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="7.5" cy="12" rx="5" ry="5.5"/><ellipse cx="16" cy="12" rx="2.4" ry="5.2"/><path d="M21 7v10"/></svg></a>
  </p>`;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Pop the newly worn props in one after another.
  const pop = worn => worn.querySelectorAll('.dz-prop').forEach((g, i) => { g.style.animationDelay = `${i * 70}ms`; g.classList.add('is-new'); });

  /* 9. Paper doll drag */
  R('dress-drag', 'Paper doll drag', 'Drag props from the tray onto the doll; they stick where you drop them, a little crooked like stickers. Drag one off the card to take it off.',
    (root, { scope: sc, content: c }) => {
      const tray = OUTFITS.map(o => `<div class="dz-row"><button type="button" class="dz-chip" data-o="${o.id}">${o.name}</button>${o.props.map(id => `<button type="button" class="dz-item" data-p="${id}" title="${PROPS[id].name}" aria-label="Put on ${PROPS[id].name}">${icon(id)}</button>`).join('')}</div>`).join('');
      const box = postcard(sc, root, c, 'dz-drag', `${stage()}<div class="dz-tray">${tray}<button type="button" class="dz-chip is-quiet" data-clear>Clear</button></div>`);
      const svg = box.querySelector('.dz-stage'), worn = box.querySelector('.dz-worn'), zone = box.querySelector('.dz');
      const toSvg = (x, y) => { const pt = svg.createSVGPoint(); pt.x = x; pt.y = y; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
      const tilt = () => Math.round(Math.random() * 16 - 8);
      let drag = null;
      const start = (e, g, fresh) => {
        e.preventDefault();
        const t = g.transform.baseVal.getItem(0).matrix, p = toSvg(e.clientX, e.clientY);
        drag = { g, fresh, ox: p.x - t.e, oy: p.y - t.f, sx: e.clientX, sy: e.clientY, moved: false };
        worn.appendChild(g);
        g.classList.add('is-held');
      };
      sc.on(box, 'pointerdown', e => {
        const item = e.target.closest('.dz-item'), g = e.target.closest('.dz-prop');
        if (item) {
          // Grab a fresh copy of the prop under the pointer.
          const p = toSvg(e.clientX, e.clientY);
          worn.insertAdjacentHTML('beforeend', place(item.dataset.p, p.x, p.y, tilt()));
          start(e, worn.lastElementChild, true);
        } else if (g) start(e, g, false);
      });
      sc.on(window, 'pointermove', e => {
        if (!drag) return;
        if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 4) drag.moved = true;
        const p = toSvg(e.clientX, e.clientY), m = drag.g.getAttribute('transform').replace(/^translate\([^)]*\)/, `translate(${(p.x - drag.ox).toFixed(1)} ${(p.y - drag.oy).toFixed(1)})`);
        drag.g.setAttribute('transform', m);
      });
      sc.on(window, 'pointerup', e => {
        if (!drag) return;
        const { g, fresh, moved } = drag;
        drag = null;
        g.classList.remove('is-held');
        const r = zone.getBoundingClientRect();
        const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        if (fresh && !moved) {
          // A tap on a tray item puts the prop in its place (and swaps out whatever was there).
          g.remove();
          const id = g.dataset.p;
          worn.querySelectorAll('.dz-prop').forEach(w => { if (PROPS[w.dataset.p].slot === PROPS[id].slot) w.remove(); });
          worn.insertAdjacentHTML('beforeend', onSlot(id));
          pop(worn);
        } else if (outside) g.remove();
      });
      sc.on(box, 'click', e => {
        const chip = e.target.closest('.dz-chip');
        if (!chip) return;
        const o = OUTFITS.find(x => x.id === chip.dataset.o);
        worn.innerHTML = o ? o.props.map(onSlot).join('') : '';
        pop(worn);
      });
    }, 'Drag a prop onto the doll, or tap it to put it in place. Drag a worn prop off the card to remove it. The outfit names dress the whole look.');

  /* 10. Shuffle machine */
  R('dress-shuffle', 'Shuffle machine', 'Pull the lever and four reels spin, one per slot, then land on a random outfit with a caption to match.',
    (root, { scope: sc, content: c }) => {
      const slots = Object.keys(SLOTS);
      const options = slot => Object.keys(PROPS).filter(id => PROPS[id].slot === slot);
      const reels = slots.map(s => `<div class="dz-reel" data-s="${s}" title="${SLOTS[s].label}">${icon(options(s)[0])}</div>`).join('');
      const box = postcard(sc, root, c, 'dz-shuffle', `${stage()}<div class="dz-machine"><div class="dz-reels">${reels}</div><button type="button" class="dz-lever" aria-label="Pull the lever"><span></span></button></div><p class="dz-caption" aria-live="polite"></p>`);
      const worn = box.querySelector('.dz-worn'), caption = box.querySelector('.dz-caption'), lever = box.querySelector('.dz-lever');
      const show = picks => {
        worn.innerHTML = picks.map(onSlot).join('');
        pop(worn);
        const o = OUTFITS.find(x => x.props.every(id => picks.includes(id)));
        caption.innerHTML = o ? `<b>${o.name}.</b> ${o.note}` : `<b>Sneha, ${PROPS[picks[1]].word} ${PROPS[picks[2]].word}.</b> Pull again?`;
      };
      let busy = false;
      const pull = () => {
        if (busy) return;
        busy = true;
        lever.classList.add('is-down');
        sc.timeout(() => lever.classList.remove('is-down'), 260);
        const picks = slots.map(s => { const o = options(s); return o[Math.floor(Math.random() * o.length)]; });
        if (reduced()) { box.querySelectorAll('.dz-reel').forEach((r, i) => { r.innerHTML = icon(picks[i]); }); show(picks); busy = false; return; }
        // Each reel flips through its options, and they stop left to right.
        box.querySelectorAll('.dz-reel').forEach((r, i) => {
          const o = options(slots[i]);
          let n = 0;
          const id = sc.interval(() => { r.innerHTML = icon(o[n++ % o.length]); }, 80);
          sc.timeout(() => {
            clearInterval(id);
            r.innerHTML = icon(picks[i]);
            r.classList.add('is-landed');
            sc.timeout(() => r.classList.remove('is-landed'), 300);
            if (i === slots.length - 1) { show(picks); busy = false; }
          }, 500 + i * 220);
        });
      };
      sc.on(lever, 'click', pull);
      show(OUTFITS[0].props);
    }, 'Pull the lever for a random outfit. Land all four from one outfit to see its name.');

  /* 11. Outfit cards */
  R('dress-cards', 'Outfit cards', 'A small fan of outfit cards under the doll; tap one and the whole look swaps in, prop by prop.',
    (root, { scope: sc, content: c }) => {
      const cards = OUTFITS.map((o, i) => `<button type="button" class="dz-ocard" data-o="${o.id}" style="--tilt:${i ? 4 : -4}deg" aria-pressed="false"><span class="dz-ocard-icons">${o.props.map(icon).join('')}</span><b>${o.name}</b><span>${o.note}</span></button>`).join('');
      const box = postcard(sc, root, c, 'dz-cards', `${stage()}<div class="dz-fan">${cards}</div>`);
      const worn = box.querySelector('.dz-worn');
      const wear = id => {
        const o = OUTFITS.find(x => x.id === id);
        worn.innerHTML = o.props.map(onSlot).join('');
        pop(worn);
        box.querySelectorAll('.dz-ocard').forEach(b => { const on = b.dataset.o === id; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
      };
      sc.on(box, 'click', e => { const b = e.target.closest('.dz-ocard'); if (b) wear(b.dataset.o); });
      wear(OUTFITS[0].id);
    }, 'Tap an outfit card to dress the doll in it.');

  /* ================= v4: Shuffle machine with personas ================= */
  // Six personas, four props each (names: what each prop is, shown on hover); the outfit never changes. Everything is drawn in the doll's own
  // coordinates (240 x 320), so a prop lands in place without any fitting.
  const SK = '#c58c5a', SK2 = '#a87346', HAIR = '#2a1c15', LINE = '#2a2620';
  const ARM_L = 'M96 142 Q80 176 62 216', ARM_R = 'M144 142 Q160 176 178 216';
  const TORSO = 'M104 124 Q120 134 136 124 L154 132 Q160 136 158 150 L152 210 H88 L82 150 Q80 136 86 132 Z';
  // Sleeves follow the arms from inside the shoulder, so they always connect.
  const sleeves = (c, end = 'long') => {
    const [l, r] = end === 'long' ? ['M96 142 Q80 176 65 209', 'M144 142 Q160 176 175 209'] : end === 'three' ? ['M96 142 Q84 168 73 192', 'M144 142 Q156 168 167 192'] : ['M96 142 Q88 158 83 168', 'M144 142 Q152 158 157 168'];
    return `<path d="${l}" stroke="${c}" stroke-width="18" stroke-linecap="round" fill="none"/><path d="${r}" stroke="${c}" stroke-width="18" stroke-linecap="round" fill="none"/>`;
  };
  const shade = '<path d="M138 138 L156 148 L152 210 H134 Z" fill="#000" opacity=".12"/>';
  // Sneha's outfit: a mustard cardigan over a striped tee.
  const OUTFIT = `<path d="${TORSO}" fill="#f2ead9"/>${[142, 154, 166, 178, 190, 202].map(y => `<path d="M108 ${y}h24" stroke="#33466b" stroke-width="4"/>`).join('')}${sleeves('#d9a23a')}<path d="M104 124L86 132Q80 136 82 150L88 212H116L110 140Z" fill="#d9a23a"/><path d="M136 124L154 132Q160 136 158 150L152 212H124L130 140Z" fill="#d9a23a"/>${shade}<path d="M88 207H116M124 207H152" stroke="#bf8a2b" stroke-width="6"/><g fill="#7a4f1a"><circle cx="127" cy="160" r="2.6"/><circle cx="126" cy="178" r="2.6"/><circle cx="125" cy="196" r="2.6"/></g><path d="M66 204l12 6M174 210l12-6" stroke="#bf8a2b" stroke-width="7" stroke-linecap="round"/>`;

  const PERSONAS = [
    { id: 'studio', name: 'Studio day', label: 'Artist', names: ['Beret', 'Pink glasses', 'iPad with Procreate', 'Apple Pencil'],
      head: `<g transform="rotate(-8 120 40)"><ellipse cx="118" cy="40" rx="42" ry="15" fill="#b44a36"/><path d="M76 42q42 16 84 0q-4 9-42 10q-38-1-42-10z" fill="#8f3727"/><ellipse cx="106" cy="34" rx="18" ry="5" fill="#cf6b52" opacity=".7"/><path d="M119 26l1-7" stroke="#8f3727" stroke-width="4" stroke-linecap="round"/></g>`,
      face: `<g fill="#eea6b8" fill-opacity=".14" stroke="#eea6b8" stroke-width="3.4"><circle cx="108" cy="83" r="11.5"/><circle cx="132" cy="83" r="11.5"/></g><g fill="none" stroke="#f8d3dc" stroke-width="1.2"><circle cx="108" cy="83" r="9.6"/><circle cx="132" cy="83" r="9.6"/></g><path d="M119 81q1-3 2 0M96.5 81L87 78M143.5 81L153 78" stroke="#eea6b8" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M101 79a7 7 0 0 1 5-4M125 79a7 7 0 0 1 5-4" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8" stroke-linecap="round"/>`,
      left: `<g transform="rotate(-14 52 208)"><rect x="24" y="184" width="56" height="44" rx="6" fill="#3a3f4a"/><rect x="29" y="189" width="46" height="34" rx="2.5" fill="#f4efe6"/><path d="M36 214q8-16 18-10t16-8" stroke="#d0603f" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="44" cy="200" r="4" fill="#6f9fc8"/><path d="M58 216l8-3" stroke="#7d9a6a" stroke-width="2.4" stroke-linecap="round"/><rect x="29" y="189" width="7" height="34" fill="#e6dfd2"/><g fill="#d0603f"><rect x="30.5" y="192" width="4" height="4" rx="1"/></g><g fill="#6f9fc8"><rect x="30.5" y="198" width="4" height="4" rx="1"/></g><g fill="#e6b84a"><rect x="30.5" y="204" width="4" height="4" rx="1"/></g><circle cx="77.5" cy="206" r="1.2" fill="#6b7280"/></g>`,
      right: { art: `<g transform="rotate(24 182 214)"><rect x="179" y="166" width="7" height="58" rx="3.5" fill="#e9e6e1"/><rect x="179" y="166" width="3" height="58" rx="1.5" fill="#fff" opacity=".6"/><path d="M179 224h7l-3.5 9z" fill="#c9c4bc"/><path d="M181.6 230h1.8l-.9 3z" fill="#3a3f4a"/><rect x="179" y="174" width="7" height="3" fill="#6f9fc8"/></g>` } },
    { id: 'field', name: 'Field notes', label: 'Researcher', names: ['Headband and pencil', 'Pink glasses', 'Sticky notes', 'Magnifying glass'],
      head: `<path d="M86 64Q120 40 154 64" stroke="#7d9a6a" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M92 58Q120 42 148 58" stroke="#9cb88a" stroke-width="2" fill="none" stroke-linecap="round"/><g transform="rotate(-62 160 66)"><rect x="152" y="63" width="30" height="5.5" rx="1" fill="#e9b949"/><path d="M182 63l6 2.75-6 2.75z" fill="#e8cfa3"/><path d="M186.4 65l1.6.75-1.6.75z" fill="${LINE}"/><rect x="147" y="63" width="5" height="5.5" rx="1" fill="#d9786a"/><rect x="151" y="63" width="2.5" height="5.5" fill="#b8b8b8"/></g>`,
      face: `<g fill="#eea6b8" fill-opacity=".14" stroke="#eea6b8" stroke-width="3"><rect x="96" y="75" width="22" height="17" rx="7"/><rect x="122" y="75" width="22" height="17" rx="7"/></g><path d="M118 81q2-2 4 0M96 80L87 77M144 80L153 77" stroke="#eea6b8" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M100 79l5-2M126 79l5-2" stroke="#fff" stroke-width="1.6" opacity=".8" stroke-linecap="round"/>`,
      left: `<g transform="rotate(-10 52 210)"><rect x="34" y="194" width="34" height="34" rx="2" fill="#7fc4b8"/></g><g transform="rotate(6 52 206)"><rect x="34" y="190" width="34" height="34" rx="2" fill="#f0a3a0"/></g><g transform="rotate(-3 52 204)"><rect x="34" y="186" width="34" height="34" rx="2" fill="#f2d16b"/><path d="M34 186h34v7H34z" fill="#e2bf55"/><path d="M40 200h20M40 208h15M40 215h22" stroke="#6b5a2a" stroke-width="2" stroke-linecap="round" opacity=".55"/></g>`,
      right: { art: `<path d="M180 226L191 197" stroke="#6b4a2e" stroke-width="7" stroke-linecap="round"/><circle cx="198" cy="178" r="18" fill="#cfe6ea" fill-opacity=".55" stroke="#b8893a" stroke-width="5"/><path d="M188 172a12 12 0 0 1 8-6" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".8"/>` } },
    { id: 'ship', name: 'Ship it', label: 'Builder', names: ['Headphones', 'Blue-light glasses', 'Laptop', 'Tea mug'],
      head: `<path d="M82 88Q78 28 120 28Q162 28 158 88" stroke="#4d5d73" stroke-width="7" fill="none"/><path d="M90 50Q120 30 150 50" stroke="#6b7c93" stroke-width="2" fill="none"/><rect x="72" y="70" width="17" height="30" rx="8" fill="#4d5d73"/><rect x="151" y="70" width="17" height="30" rx="8" fill="#4d5d73"/><rect x="84" y="74" width="7" height="22" rx="3.5" fill="#2f3a48"/><rect x="149" y="74" width="7" height="22" rx="3.5" fill="#2f3a48"/><circle cx="78" cy="85" r="3" fill="#d0603f"/><circle cx="162" cy="85" r="3" fill="#d0603f"/>`,
      face: `<g fill="#f4c57a" fill-opacity=".3" stroke="#eea6b8" stroke-width="3.2"><rect x="95" y="76" width="23" height="15" rx="3"/><rect x="122" y="76" width="23" height="15" rx="3"/></g><path d="M118 81h4M95 80L87 77M145 80L153 77" stroke="#eea6b8" stroke-width="3" stroke-linecap="round"/><path d="M99 80l6-2M125 80l6-2" stroke="#fff" stroke-width="1.6" opacity=".7" stroke-linecap="round"/>`,
      left: `<g transform="rotate(-12 56 206)"><rect x="30" y="182" width="52" height="40" rx="5" fill="#c3c7cd"/><rect x="30" y="182" width="52" height="8" rx="4" fill="#d5d8dd"/><rect x="30" y="218" width="52" height="5" rx="2" fill="#a4a9b0"/><circle cx="46" cy="200" r="5.5" fill="#e0703a"/><path d="M64 194l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1z" fill="#e6b84a"/><rect x="40" y="208" width="15" height="7" rx="3.5" fill="#7d9a6a"/></g>`,
      right: { art: `<path d="M176 196c-2-4 2-6 0-10M186 196c-2-4 2-6 0-10" stroke="#9aa0a8" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/><path d="M194 206q11 0 11 9t-11 9" stroke="#e8dcc8" stroke-width="5" fill="none"/><path d="M166 200h28v22q0 10-10 10h-8q-10 0-10-10z" fill="#efe6d6"/><path d="M186 200h8v22q0 10-10 10h-2q8-2 4-10z" fill="#d8ccb6"/><rect x="166" y="210" width="28" height="5" fill="#c4473a"/><path d="M181 200q8 4 8 12" stroke="#b9a98f" stroke-width="1" fill="none"/><rect x="185" y="212" width="8" height="9" rx="1" fill="#e6b84a"/>` } },
    { id: 'record', name: 'Record night', label: 'Party', names: ['Polka-dot bandana', 'Tinted shades', 'Vinyl record', 'Vintage mic'],
      head: `<path d="M84 62Q120 38 156 62L154 72Q120 50 86 72Z" fill="#c4473a"/><g fill="#f7f2e8"><circle cx="98" cy="60" r="1.8"/><circle cx="110" cy="54" r="1.8"/><circle cx="122" cy="52" r="1.8"/><circle cx="134" cy="54" r="1.8"/><circle cx="146" cy="60" r="1.8"/></g><path d="M86 72Q120 52 154 72" stroke="#9e3529" stroke-width="2" fill="none"/><circle cx="158" cy="66" r="5.5" fill="#a93b2f"/><path d="M160 64l15 9-4 5zM160 67l11 16-6 2z" fill="#c4473a"/>`,
      face: `<g fill="#5a2f4f" fill-opacity=".85" stroke="#c9a24a" stroke-width="1.8"><circle cx="108" cy="83" r="11"/><circle cx="132" cy="83" r="11"/></g><path d="M119 81q1-3 2 0M97 80L87 77M143 80L153 77" stroke="#c9a24a" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M101 79a7 7 0 0 1 6-4M125 79a7 7 0 0 1 6-4" stroke="#fff" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/>`,
      left: `<circle cx="54" cy="204" r="27" fill="#1f1b1a"/><circle cx="54" cy="204" r="21" fill="none" stroke="#3a3330" stroke-width="1.5"/><circle cx="54" cy="204" r="15" fill="none" stroke="#3a3330" stroke-width="1.5"/><circle cx="54" cy="204" r="9" fill="#d0603f"/><circle cx="54" cy="204" r="1.8" fill="#f2ead9"/><path d="M36 190a24 24 0 0 1 14-10" stroke="#fff" stroke-width="3" fill="none" opacity=".25" stroke-linecap="round"/>`,
      right: { art: `<path d="M181 224L190 194" stroke="#2a2626" stroke-width="8" stroke-linecap="round"/><ellipse cx="192" cy="180" rx="11" ry="14" fill="#c9ccd1"/><path d="M182 174h20M181 180h22M182 186h20" stroke="#9aa0a8" stroke-width="1.4"/><path d="M181 180v-3a11 11 0 0 1 22 0v3" fill="none" stroke="#e3e6ea" stroke-width="2" opacity=".7"/><path d="M182 191h20" stroke="#8a9098" stroke-width="3"/>` } },
    { id: 'garden', name: 'Garden & chai', label: 'Gardener', names: ['Straw sun hat', 'Cat-eye sunglasses', 'Cutting chai', 'Watering can'],
      head: `<ellipse cx="120" cy="52" rx="64" ry="15" fill="#e3c27a"/><ellipse cx="120" cy="52" rx="52" ry="10" fill="none" stroke="#c9a35a" stroke-width="1.6" stroke-dasharray="3 3"/><path d="M90 52Q92 16 120 16Q148 16 150 52Z" fill="#d9b56a"/><path d="M100 30q20-10 40 0" stroke="#c9a35a" stroke-width="1.6" fill="none" stroke-dasharray="3 3"/><path d="M91 44Q120 50 149 44L150 52Q120 58 90 52Z" fill="#7d9a6a"/><path d="M60 56q60 18 120 0" stroke="#c9a35a" stroke-width="2" fill="none"/>`,
      face: `<path d="M94 80Q96 73 106 75L118 77Q118 91 108 92Q97 92 94 80Z M146 80Q144 73 134 75L122 77Q122 91 132 92Q143 92 146 80Z" fill="#2b2523"/><path d="M118 79q2-2 4 0M94 79L88 73M146 79L152 73" stroke="#2b2523" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M100 79l6-2M128 79l6-2" stroke="#fff" stroke-width="1.8" opacity=".55" stroke-linecap="round"/>`,
      left: `<path d="M50 190c-2-4 2-6 0-10M60 190c-2-4 2-6 0-10" stroke="#9aa0a8" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/><path d="M45 194h26l-3.5 34h-19z" fill="#e9e2d6" fill-opacity=".6" stroke="#cfc6b6" stroke-width="1.4"/><path d="M46.5 203h23l-2.6 25h-17.8z" fill="#a8642f"/><path d="M48 210h20M48.6 218h18.6" stroke="#c88a52" stroke-width="1.2" opacity=".6"/><path d="M49 196l2 30" stroke="#fff" stroke-width="2" opacity=".5"/>`,
      right: { art: `<path d="M171 196q13-20 26 0" stroke="#5d8559" stroke-width="4" fill="none"/><path d="M193 208L220 186" stroke="#6f9a6a" stroke-width="6" stroke-linecap="round"/><ellipse cx="223" cy="183" rx="5" ry="7.5" transform="rotate(-40 223 183)" fill="#5d8559"/><path d="M166 196h31l-3 34h-25z" fill="#6f9a6a"/><path d="M186 196h11l-3 34h-9z" fill="#5d8559"/><path d="M166 202h31" stroke="#8ab585" stroke-width="2"/><g fill="#8fc3d6"><circle cx="230" cy="194" r="2"/><circle cx="226" cy="200" r="1.6"/><circle cx="233" cy="203" r="1.6"/></g>` } },
    { id: 'cyber', name: 'Cyber guard', label: 'Security', names: ['Helmet', 'Hero mask', 'Padlock shield', 'Big key'],
      head: `<path d="M82 78Q80 26 120 26Q160 26 158 78Z" fill="#8fa3b8"/><path d="M96 40q14-10 30-8" stroke="#c3d0dd" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M86 56Q120 42 154 56L152 66Q120 54 88 66Z" fill="#7fd3e0" fill-opacity=".75"/><path d="M120 26V14" stroke="#6d8197" stroke-width="3"/><circle cx="120" cy="12" r="4.5" fill="#e0703a"/><circle cx="84" cy="76" r="7" fill="#6d8197"/><circle cx="156" cy="76" r="7" fill="#6d8197"/>`,
      face: `<path d="M88 81Q91 70 108 72Q120 76 132 72Q149 70 152 81Q150 95 134 93Q120 89 106 93Q90 95 88 81Z" fill="#e0703a"/><path d="M152 80l10-5-2 8z" fill="#c95f2c"/><ellipse cx="108" cy="83" rx="7" ry="5.5" fill="#f7f2e8"/><ellipse cx="132" cy="83" rx="7" ry="5.5" fill="#f7f2e8"/><ellipse cx="108" cy="83" rx="3.4" ry="4" fill="#231a15"/><ellipse cx="132" cy="83" rx="3.4" ry="4" fill="#231a15"/>`,
      left: `<path d="M32 186h48v18q0 26-24 38q-24-12-24-38z" fill="#3d4f6e"/><path d="M37 191h38v13q0 21-19 31q-19-10-19-31z" fill="none" stroke="#8fa3b8" stroke-width="2.6"/><path d="M50 206v-6a6 6 0 0 1 12 0v6" stroke="#e0703a" stroke-width="3.5" fill="none"/><rect x="46" y="205" width="20" height="16" rx="3" fill="#e0703a"/><circle cx="56" cy="212" r="2.4" fill="#3d4f6e"/>`,
      right: { art: `<g transform="rotate(26 182 214)"><circle cx="182" cy="166" r="11" fill="none" stroke="#d9a63a" stroke-width="6"/><circle cx="182" cy="166" r="11" fill="none" stroke="#f0c766" stroke-width="1.6" stroke-dasharray="6 30"/><rect x="179" y="176" width="6" height="46" rx="2" fill="#d9a63a"/><rect x="185" y="206" width="9" height="5" fill="#d9a63a"/><rect x="185" y="214" width="6" height="5" fill="#d9a63a"/></g>` } },
  ];
  const PSLOTS = [['head', 'Head'], ['face', 'Face'], ['left', 'Left hand'], ['right', 'Right hand']];
  const VIEW = { head: '52 4 136 104', face: '84 64 72 44', left: '18 172 76 76', right: '154 148 82 82' };
  const who = pid => `${PERSONAS.find(p => p.id === pid).label} Sneha`;
  const propName = (slot, pid) => PERSONAS.find(p => p.id === pid).names[PSLOTS.findIndex(([s]) => s === slot)];
  const pieceOf = (slot, pid) => { const v = PERSONAS.find(p => p.id === pid)[slot]; return typeof v === 'string' ? { art: v } : v; };
  const pIcon = (slot, pid) => `<svg viewBox="${VIEW[slot]}" aria-hidden="true">${pieceOf(slot, pid).art}</svg>`;
  // The doll, in layers: hair (back), legs, arms, outfit; then the head; thumbs go over whatever is held.
  const BODY = `
    <path d="M78 84C74 44 98 30 120 30C144 30 166 44 162 84L168 158Q154 170 140 160L138 118H102L100 160Q86 170 72 158Z" fill="${HAIR}"/>
    <path d="M90 204H150L162 290H126L120 236L114 290H78Z" fill="#3b3631"/><path d="M126 290L120 236L124 222L138 290Z" fill="#2e2a26" opacity=".6"/>
    <path d="M78 290h36v6q0 6-6 6H82q-4 0-4-6z M126 290h36v6q0 6-4 6h-26q-6 0-6-6z" fill="#f1ece2"/><path d="M78 299h36M126 299h36" stroke="#c9c0b2" stroke-width="3"/>
    <path d="${ARM_L}" stroke="${SK}" stroke-width="13" stroke-linecap="round" fill="none"/><path d="${ARM_R}" stroke="${SK}" stroke-width="13" stroke-linecap="round" fill="none"/>
    <circle cx="60" cy="220" r="8.5" fill="${SK}"/><circle cx="180" cy="220" r="8.5" fill="${SK}"/>
    ${OUTFIT}`;
  const HEAD = `
    <path d="M110 102h20v24q-10 8-20 0z" fill="${SK2}"/>
    <circle cx="86" cy="86" r="6" fill="${SK}"/><circle cx="154" cy="86" r="6" fill="${SK}"/>
    <ellipse cx="120" cy="80" rx="34" ry="38" fill="${SK}"/>
    <path d="M84 80C82 48 100 36 122 36C146 36 160 52 157 80C150 64 138 54 124 50C116 62 102 72 84 80Z" fill="${HAIR}"/>
    <path d="M86 76q-6 30-2 62M154 76q6 30 2 62" stroke="${HAIR}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M100 46q14-6 30-2" stroke="#4a3427" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M100 70q8-4 15-1M125 69q7-3 15 1" stroke="${HAIR}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <ellipse cx="108" cy="83" rx="3.4" ry="4" fill="#231a15"/><ellipse cx="132" cy="83" rx="3.4" ry="4" fill="#231a15"/><circle cx="109.2" cy="81.6" r="1" fill="#fff"/><circle cx="133.2" cy="81.6" r="1" fill="#fff"/>
    <path d="M120 88q-3 7 1 9" stroke="${SK2}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="99" cy="95" rx="5.5" ry="3" fill="#e8909a" opacity=".18"/><ellipse cx="141" cy="95" rx="5.5" ry="3" fill="#e8909a" opacity=".18"/>
    <path d="M110 102q10 8 20 0" stroke="#7a3b2e" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  const THUMBS = `<ellipse cx="65" cy="215" rx="4.5" ry="5.5" fill="${SK}"/><ellipse cx="175" cy="215" rx="4.5" ry="5.5" fill="${SK}"/>`;
  const dressed = picks => {
    const piece = slot => { const i = PSLOTS.findIndex(([s]) => s === slot); return `<g class="dz-piece" data-label="${propName(slot, picks[i])}">${pieceOf(slot, picks[i]).art}</g>`; };
    return `<g filter="url(#gw-brush)">${BODY}${HEAD}${piece('face')}${piece('head')}${piece('left')}${piece('right')}${THUMBS}</g>`;
  };

  /* 12. Shuffle machine, personas */
  R('dress-personas', 'Shuffle machine: personas', 'The shuffle machine with six personas (Artist, Researcher, Builder, Party, Gardener, Security). Each pull swaps in a whole persona at once; the lever breathes until the first pull. Hover a prop to see what it is.',
    (root, { scope: sc, content: c }) => {
      const reels = PSLOTS.map(([slot]) => `<div class="dz-reel" data-label="${propName(slot, PERSONAS[0].id)}">${pIcon(slot, PERSONAS[0].id)}</div>`).join('');
      const box = postcard(sc, root, c, 'dz-shuffle dz-personas', `<svg class="dz-stage" viewBox="0 6 240 304" role="img" aria-label="A drawn doll of Sneha to dress up"></svg><div class="dz-machine"><div class="dz-reels">${reels}</div><button type="button" class="dz-lever is-idle" aria-label="Pull the lever"><span></span></button></div><p class="dz-caption" aria-live="polite"></p><span class="dz-tip" aria-hidden="true"></span>`);
      const svg = box.querySelector('.dz-stage'), caption = box.querySelector('.dz-caption'), lever = box.querySelector('.dz-lever');
      const reelEls = [...box.querySelectorAll('.dz-reel')];
      let current = PERSONAS[0].id;
      // A whole persona swaps in at once; the doll does a quick zoom out as it lands.
      const show = pid => {
        current = pid;
        const picks = PSLOTS.map(() => pid);
        svg.innerHTML = dressed(picks);
        reelEls.forEach((r, i) => { r.innerHTML = pIcon(PSLOTS[i][0], pid); r.dataset.label = propName(PSLOTS[i][0], pid); });
        caption.innerHTML = `<b>${who(pid)}</b>`;
        if (reduced()) return;
        [svg, ...reelEls].forEach(el => { el.classList.remove('is-swap'); void el.getBoundingClientRect(); el.classList.add('is-swap'); });
      };
      // Hover a prop (on the doll or in a reel) to see what it is; a tap or click shows it for 2s
      // (phones have no hover).
      const tip = box.querySelector('.dz-tip'), zone = box.querySelector('.dz');
      let tipTimer = 0;
      const showTip = (e, t) => {
        const z = zone.getBoundingClientRect();
        tip.textContent = t.dataset.label;
        tip.style.translate = `${e.clientX - z.left + 12}px ${e.clientY - z.top + 14}px`;
        tip.classList.add('is-on');
      };
      sc.on(zone, 'pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        const t = e.target.closest('[data-label]');
        clearTimeout(tipTimer);
        if (t) showTip(e, t); else tip.classList.remove('is-on');
      });
      sc.on(zone, 'click', e => {
        const t = e.target.closest('[data-label]');
        if (!t) return;
        showTip(e, t);
        clearTimeout(tipTimer);
        tipTimer = sc.timeout(() => tip.classList.remove('is-on'), 2000);
      });
      sc.on(zone, 'pointerleave', e => { if (e.pointerType === 'mouse') tip.classList.remove('is-on'); });
      const pull = () => {
        lever.classList.remove('is-idle', 'is-down');
        void lever.offsetWidth;
        lever.classList.add('is-down');
        sc.timeout(() => lever.classList.remove('is-down'), 280);
        // Always a full persona, never the one already on.
        const ids = PERSONAS.map(p => p.id).filter(id => id !== current);
        show(ids[Math.floor(Math.random() * ids.length)]);
      };
      sc.on(lever, 'click', pull);
      show(PERSONAS[0].id);
    }, 'Pull the lever to switch to another persona. Hover a prop to see what it is.');
})();
