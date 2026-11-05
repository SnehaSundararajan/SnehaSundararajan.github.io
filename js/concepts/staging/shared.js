/* Staging: shared pieces for the sticker-desk iterations.
   - deskData(): the stickers (name, roles, tagline, nav, decoration) and the
     handwritten notes, so every iteration uses the same set.
   - outline(): a pencil outline of any sticker shape (burst, circle, bubble,
     paper, stamp, tape, pill, smile, heart, hex, tile, label), sized to the
     sticker, for the sketch style. */

window.Staging = (function () {
  // Picture stickers load straight from these URLs. Save local copies in lab/assets/ and point here
  // before publishing: the LinkedIn link carries an expiry token.
  const IMAGES = {
    octopus: 'https://media.githubusercontent.com/media/SnehaSundararajan/SnehaSundararajan.github.io/main/octopus_new.png',
    portrait: 'https://media.licdn.com/dms/image/v2/D5603AQGqLjuncEpjmg/profile-displayphoto-scale_400_400/B56ZxiQN.KKcAg-/0/1771174947296?e=1794441600&v=beta&t=naapOs6Dqg6zsgMUUX97dGfdIpHDOOCJPbbhiw53g-0',
  };
  // The turntable's song, from SoundCloud (Share > Embed on the track page gives the track id).
  // The band's own upload streams the full track, and the widget API lets the turntable play and pause it.
  const MUSIC = { title: 'Floated By', artist: 'Peter Cat Recording Co.', soundcloudTrack: '1304405920', url: 'https://soundcloud.com/petercatrecordingco/peter-cat-recording-co-floated' };
  const BURST = [[50, 0], [61, 15], [79, 9], [80, 27], [97, 32], [88, 48], [98, 63], [81, 70], [79, 89], [61, 84], [50, 100], [39, 84], [21, 89], [19, 70], [2, 63], [12, 48], [3, 32], [20, 27], [21, 9], [39, 15]];
  const TAPE = [[0, 0], [100, 0], [97, 25], [100, 50], [97, 75], [100, 100], [0, 100], [3, 75], [0, 50], [3, 25]];
  const HEX = [[25, 0], [75, 0], [100, 50], [75, 100], [25, 100], [0, 50]];

  /** narrow: the stage width in px (picks desktop, tablet, or phone), or true/false for phone/desktop. */
  function deskData(c, narrow) {
    const words = c.name.trim().split(/\s+/);
    const roles = c.role.split('·').map(s => s.trim()).filter(Boolean);
    // c.images: the website's own picture paths (its content.js); the lab keeps the remote ones.
    const img = { ...IMAGES, ...c.images };
    // Each sticker once: [label, shape, color, go, icon, img, hover text shown inside the sticker].
    const STICKERS = {
      work:     ['Work', 'burst', 'var(--pop-yellow)', 'work'],
      about:    ['About me', 'circle', 'var(--pop-pink)', 'about'],
      // Email: a painted envelope tile; clicking copies the address (content.email) to the clipboard.
      email:    ['', 'mail', 'var(--pop-mint)', 'email'],
      resume:   ['resume', 'paper', '#fff', 'resume'],
      tape:     ['Design @ Palo Alto Networks', 'tape', 'var(--pop-orange)'],
      octopus:  ['', 'cutout', 'none', null, null, img.octopus, 'draws sometimes'],
      photo:    ['', 'photo', '#fff', 'about', null, img.portrait, "hi, it's me!"],
      turntable:['', 'turntable', 'oklch(82% 0.025 75)'],
      // LinkedIn: a painted "in" tile in LinkedIn blue; opens content.linkedin in a new tab.
      linkedin: ['in', 'linkedin', '#0a66c2', 'linkedin'],
      // Heart: a conversation candy heart (chalky pastel, red stamped letters) that invites a drag.
      heart:    ['drag me', 'heart', 'var(--pop-pink)'],
      tea:      ['', 'cup', 'var(--pop-mint)', null, null, null, 'loves tea'],
    };
    // Where each sticker sits per layout: [xPct, yPct, rot]. Stickers missing from a layout are left out.
    const LAYOUTS = {
      // Default layout, set from your arrangement on 2026-10-27.
      desktop: { work: [75, 27, -8], about: [90.5, 51, 10], email: [92.5, 72, -4], resume: [79.5, 74, 4], tape: [34, 79, -7],
        octopus: [43, 16, -6], photo: [55.5, 42, -4], turntable: [59.5, 77, -4], linkedin: [73.5, 51.5, 6], heart: [7.5, 89, -10], tea: [90.5, 25, 6] },
      // Tablet (about 700 to 1040px wide): set from your arrangement on 2026-10-27.
      tablet: { about: [46, 10.5, 10], work: [60, 15, -8], octopus: [84, 16.5, -6], tea: [88, 37, 6],
        photo: [64.5, 45, -4], linkedin: [92, 57, 6], tape: [26, 69, -7], email: [70.5, 71, -4],
        turntable: [55, 83, -4], resume: [88.5, 82, 6], heart: [8.5, 89, -10] },
      // Phone: set from your arrangement on 2026-10-27.
      mobile: { photo: [38.5, 60.5, -4], about: [74, 55, 10], linkedin: [78, 71, 6],
        work: [19, 72.5, -8], octopus: [51, 86, -6], email: [80, 87, -4], resume: [22, 88.5, 6] },
    };
    const layout = typeof narrow === 'number' ? (narrow < 700 ? 'mobile' : narrow < 1040 ? 'tablet' : 'desktop') : (narrow ? 'mobile' : 'desktop');
    // While a sticker is hidden (c.hidden), its neighbors close the gap it leaves; showing it again
    // restores the arrangement above exactly.
    const CLOSE_GAP = {
      resume: {
        desktop: { turntable: [69.5, 75.5, -4] }, // the record player shifts right, toward the resume's spot
        tablet: { email: [85, 78, -4], turntable: [63, 82, -4] },
        mobile: { work: [21, 82, -8], octopus: [53, 86, -6], email: [82, 84, -4] },
      },
    };
    const spots = { ...LAYOUTS[layout] };
    (c.hidden || []).forEach(k => Object.assign(spots, CLOSE_GAP[k]?.[layout]));
    // [label, shape, color, xPct, yPct, rot, go, icon, img, hover text]
    // c.hidden: sticker keys to leave out (the website hides resume until the PDF exists).
    const scatter = Object.entries(spots).filter(([k]) => !c.hidden?.includes(k)).map(([k, [x, y, r]]) => {
      const [label, shape, color, go = null, icon = null, img = null, hover = null] = STICKERS[k];
      return [label, shape, color, x, y, r, go, icon, img, hover];
    });
    // Handwritten notes. Only some stickers get one; the rest stay plain.
    const notes = {
      [roles[1] || 'researcher']: 'asks why ×5',
      [roles[2] || 'builder']: 'AI enabled',
      Work: 'the good stuff →',
    };
    const pills = ['var(--pop-yellow)', 'var(--pop-pink)', 'var(--pop-mint)', 'var(--pop-blue)'];
    // Phone positions were arranged with the roles ending about 41% down; the desk maps them into
    // whatever space is left under the roles, so the spacing holds on any phone height.
    const anchor = layout === 'mobile' ? 41 : null;
    return { words, roles, scatter, notes, pills, anchor };
  }

  function outline(shape, w, h) {
    const i = 3, W = Math.max(1, w - i * 2), H = Math.max(1, h - i * 2);
    const pt = ([px, py]) => `${(i + (px / 100) * W).toFixed(1)},${(i + (py / 100) * H).toFixed(1)}`;
    const ellipse = (k = 1, extra = '') => `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${(W / 2) * k}" ry="${(H / 2) * k}" ${extra}/>`;
    const rect = rx => `<rect x="${i}" y="${i}" width="${W}" height="${H}" rx="${rx}"/>`;
    let body;
    switch (shape) {
      case 'burst': body = `<polygon points="${BURST.map(pt).join(' ')}"/>`; break;
      case 'circle': body = ellipse(); break;
      case 'smile': body = ellipse() + `<circle cx="${w * 0.36}" cy="${h * 0.42}" r="${w * 0.05}"/><circle cx="${w * 0.64}" cy="${h * 0.42}" r="${w * 0.05}"/><path d="M${w * 0.3} ${h * 0.6} Q${w * 0.5} ${h * 0.8} ${w * 0.7} ${h * 0.6}"/>`; break;
      case 'stamp': body = ellipse() + ellipse(0.78, 'stroke-dasharray="4 5"'); break;
      case 'bubble': body = rect(H / 2) + `<path d="M${i + W * 0.12} ${i + H} l-6 12 l18 -10"/>`; break;
      case 'paper': body = `<polygon points="${[[0, 0], [72, 0], [100, 22], [100, 100], [0, 100]].map(pt).join(' ')}"/><polyline points="${[[72, 0], [72, 22], [100, 22]].map(pt).join(' ')}"/>`
        + [30, 42, 54].map((y, k) => `<line x1="${i + W * 0.16}" y1="${i + (H * y) / 100}" x2="${i + W * (k === 1 ? 0.6 : 0.82)}" y2="${i + (H * y) / 100}"/>`).join(''); break;
      case 'tape': body = `<polygon points="${TAPE.map(pt).join(' ')}"/>`; break;
      case 'hex': body = `<polygon points="${HEX.map(pt).join(' ')}"/>`; break;
      case 'heart': body = `<path transform="translate(${i} ${i}) scale(${W / 112} ${H / 100})" d="M56 98 C 20 72, 0 52, 0 30 C 0 12, 14 0, 30 0 C 42 0, 51 7, 56 16 C 61 7, 70 0, 82 0 C 98 0, 112 12, 112 30 C 112 52, 92 72, 56 98 Z"/>`; break;
      case 'pill': body = rect(H / 2); break;
      case 'cup': {
        // Round sticker with a small teacup drawn in the middle.
        const k = Math.min(W, H) / 80, cx = w / 2 - 25 * k, cy = h / 2 - 20 * k;
        const t = (x, y) => `${(cx + x * k).toFixed(1)} ${(cy + y * k).toFixed(1)}`;
        body = ellipse() + `<g class="sk-art"><path d="M${t(8, 18)} L${t(34, 18)} L${t(34, 26)} Q${t(34, 37)} ${t(23, 37)} L${t(19, 37)} Q${t(8, 37)} ${t(8, 26)} Z"/><path d="M${t(34, 21)} Q${t(42, 21)} ${t(42, 26)} Q${t(42, 31)} ${t(33, 31)}"/><path d="M${t(16, 4)} q${-2 * k} ${3 * k} 0 ${8 * k}M${t(23, 3)} q${-2 * k} ${3 * k} 0 ${8 * k}M${t(30, 4)} q${-2 * k} ${3 * k} 0 ${8 * k}"/></g>`;
        break;
      }
      case 'cutout': body = ''; break;
      case 'photo': body = rect(3) + `<rect x="${i + 6}" y="${i + 6}" width="${W - 12}" height="${H * 0.76}" rx="2"/>`; break;
      case 'turntable':
        body = rect(10) + `<svg x="0" y="0" width="${w}" height="${h}" viewBox="0 0 140 120" preserveAspectRatio="none" overflow="visible"><g class="tt-record"><circle cx="58" cy="62" r="45"/><circle cx="58" cy="62" r="30" stroke-dasharray="6 9"/><circle cx="58" cy="62" r="12"/></g><g class="tt-arm"><circle cx="120" cy="22" r="6"/><path d="M120 22 L118 70 L104 84"/></g></svg>`;
        break;
      case 'linkedin': body = rect(Math.min(W, H) * 0.2); break;
      case 'mail': body = rect(Math.min(W, H) * 0.2) + `<rect x="${w * 0.24}" y="${h * 0.3}" width="${w * 0.52}" height="${h * 0.4}" rx="3"/><path d="M${w * 0.26} ${h * 0.33} L${w * 0.5} ${h * 0.52} L${w * 0.74} ${h * 0.33}"/>`; break;
      case 'tile': body = rect(Math.min(W, H) * 0.22); break;
      case 'label': body = rect(4); break;
      default: body = rect(12);
    }
    return `<svg class="sk-pencil" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">${body}</svg>`;
  }

  /** The rough-pencil SVG filter. Include once per mounted iteration. */
  const roughFilter = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="sk-rough"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3"/><feDisplacementMap data-wobble="shape" data-base="3" in="SourceGraphic" scale="3"/></filter></svg>';

  /**
   * The peek cursor: a reveal circle locked to the pointer (no easing, drawn on
   * every pointer event) with a small dot in the middle marking the real
   * cursor. It stays put when the pointer leaves and only hides when the
   * window loses focus. `paint(x, y, r)` draws the reveal however a design needs.
   */
  // R: circle radius in px, or a function read every frame (live size levers; 0 hides circle and dot).
  function peek(sc, box, root, { R, start, paint }) {
    root.classList.add('is-cursor-owned');
    hoverNotes(sc, box);
    music(sc, box);
    const dot = document.createElement('div');
    dot.className = 'peek-dot';
    dot.setAttribute('aria-hidden', 'true');
    box.appendChild(dot);
    const pos = { x: start.x, y: start.y };
    // No circle on devices that cannot hover (phones, touch tablets): there is no pointer to follow,
    // so it would sit still over the desk. Checked live, so plugging in a mouse brings it back.
    const noHover = matchMedia('(hover: none)');
    const radius = () => noHover.matches ? 0 : typeof R === 'function' ? R() : R;
    let r = radius(), focused = true;
    const draw = () => {
      paint(pos.x, pos.y, r);
      dot.style.translate = `${pos.x}px ${pos.y}px`;
      dot.style.opacity = r > 2 ? '1' : '0';
    };
    sc.on(box, 'pointermove', e => {
      const b = box.getBoundingClientRect();
      pos.x = e.clientX - b.left; pos.y = e.clientY - b.top;
      focused = true;
      draw();
    });
    sc.on(window, 'focus', () => { focused = true; });
    sc.on(window, 'blur', () => { focused = false; });
    sc.on(document, 'visibilitychange', () => { focused = document.visibilityState === 'visible'; });
    let last = performance.now();
    // Only the focus fade animates; position never eases.
    sc.frame(now => {
      const dt = now - last; last = now;
      const target = focused ? radius() : 0;
      r = Lab.motion().intensity === 0 ? target : Lab.lerp(r, target, Lab.damp(0.15, dt));
      draw();
    });
  }

  /**
   * Hover notes: some stickers swap their art for a short line of text while hovered.
   * Every copy of that sticker in the desk (the top layer and the layer under the
   * circle) carries the same data-hk, so the text shows even inside the circle.
   */
  function hoverNotes(sc, box) {
    let on = null;
    const set = key => {
      if (key === on) return;
      on = key;
      box.querySelectorAll('[data-hk].is-hk').forEach(el => el.classList.remove('is-hk'));
      if (key) box.querySelectorAll('[data-hk]').forEach(el => { if (el.dataset.hk === key) el.classList.add('is-hk'); });
    };
    sc.on(box, 'pointermove', e => {
      const item = e.target.closest('.ds-item, .it1-s, .it3-s');
      set(item?.querySelector('[data-hk]')?.dataset.hk || null);
    });
    sc.on(box, 'pointerleave', () => set(null));
  }

  /**
   * The turntable: click it (without dragging) to play the song. The record spins and the arm
   * swings on in every copy of the sticker; a small now-playing card with a play/pause button appears
   * beside it. SoundCloud's own player stays hidden and only supplies the audio.
   */
  function music(sc, box) {
    let card = null, widget = null;
    const setPlaying = on => {
      box.querySelectorAll('[data-tt]').forEach(el => el.classList.toggle('is-playing', on));
      card?.classList.toggle('is-playing', on);
    };
    const stop = () => {
      setPlaying(false);
      widget?.pause();
      card?.classList.remove('is-on');
    };
    // The player starts itself (auto_play) on the first click; SoundCloud's widget API handles later pause and play.
    const mountPlayer = el => {
      const create = () => {
        widget = SC.Widget(el);
        widget.bind(SC.Widget.Events.READY, () => { if (box.querySelector('[data-tt].is-playing')) widget.play(); });
        // Keep the record and the button in step with the audio (e.g. when the song ends).
        widget.bind(SC.Widget.Events.PLAY, () => setPlaying(true));
        widget.bind(SC.Widget.Events.PAUSE, () => setPlaying(false));
        widget.bind(SC.Widget.Events.FINISH, () => setPlaying(false));
      };
      if (window.SC?.Widget) return create();
      let tag = document.querySelector('script[data-soundcloud]');
      if (!tag) {
        tag = document.createElement('script');
        tag.src = 'https://w.soundcloud.com/player/api.js'; tag.async = true; tag.dataset.soundcloud = '';
        document.head.appendChild(tag);
      }
      tag.addEventListener('load', create);
    };
    const play = item => {
      const b = box.getBoundingClientRect(), r = item.getBoundingClientRect();
      if (!card) {
        card = document.createElement('div');
        card.className = 'tt-card';
        const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(`https://api.soundcloud.com/tracks/${MUSIC.soundcloudTrack}`)}&auto_play=true&color=%23ff5500&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;
        card.innerHTML = `<button class="tt-btn" type="button" aria-label="Play or pause"><svg viewBox="0 0 16 16" aria-hidden="true"><path class="tt-ico-play" d="M5 3.5v9l7.5-4.5z"/><path class="tt-ico-pause" d="M4.5 3.5h2.5v9H4.5zM9 3.5h2.5v9H9z"/></svg></button><p class="tt-now"><span>now playing</span> ${Lab.esc(MUSIC.title)} · ${Lab.esc(MUSIC.artist)} <a href="${MUSIC.url}" target="_blank" rel="noopener">on SoundCloud ↗</a></p><iframe class="tt-embed" src="${src}" allow="autoplay; encrypted-media" title="${Lab.esc(MUSIC.title)} by ${Lab.esc(MUSIC.artist)}" tabindex="-1"></iframe>`;
        box.appendChild(card);
        mountPlayer(card.querySelector('.tt-embed'));
        card.querySelector('.tt-btn').addEventListener('click', e => { e.stopPropagation(); widget?.toggle(); });
      } else widget?.play();
      setPlaying(true);
      // Beside the turntable (right if there is room, else left), aligned to its bottom edge.
      const cw = card.offsetWidth, ch = card.offsetHeight;
      const x = r.right - b.left + 12 + cw < b.width ? r.right - b.left + 12 : Math.max(8, r.left - b.left - cw - 12);
      const y = Math.max(8, Math.min(b.height - ch - 8, r.bottom - b.top - ch));
      card.style.translate = `${x}px ${y}px`;
      card.classList.add('is-on');
    };
    sc.on(box, 'click', e => {
      const item = e.target.closest('.ds-item, .it1-s, .it3-s');
      if (!item || !item.querySelector('[data-tt]') || item.dataset.dragged === 'true') return;
      box.querySelector('[data-tt].is-playing') ? stop() : play(item);
    });
    sc.add(stop);
  }

  return { deskData, outline, roughFilter, peek, IMAGES, MUSIC };
})();
