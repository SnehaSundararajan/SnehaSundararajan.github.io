/* ==========================================================================
   Kit: shared building blocks for concepts.
   - sticker()   die-cut sticker markup (styles live in concepts.css, .d-*)
   - tossable()  drag, toss, gravity, collisions, and "go home" springs
   - camera()    pan and zoom with inertia for canvas concepts
   - pointer()   smoothed local pointer position and velocity
   - options()   small in-stage segmented controls for per-concept modes
   - specimen()  a sample hero layout for trying cursor effects in context
   - cursorOff() notice shown when the Cursor reactive lever is off
   ========================================================================== */

(function () {
  const SMILE = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="14" cy="16" r="2.4"/><circle cx="26" cy="16" r="2.4"/><path d="M12 24c4 5 12 5 16 0"/></svg>';
  const LINES = '<span class="d-lines" aria-hidden="true"><i></i><i></i><i></i></span>';

  /** Die-cut sticker face. Wrap it in a positioned element to move it. */
  const CUP = '<svg viewBox="0 0 48 44" aria-hidden="true"><path d="M8 18h26v8a11 11 0 0 1-11 11h-4A11 11 0 0 1 8 26Z"/><path d="M34 21h3a5 5 0 0 1 0 10h-4"/><path d="M5 40h34"/><path d="M16 4c-2 3 2 5 0 8M23 3c-2 3 2 5 0 8M30 4c-2 3 2 5 0 8"/></svg>';

  // Email: a simple line envelope.
  const ENVELOPE = '<svg class="env" viewBox="0 0 32 24" aria-hidden="true"><rect x="2" y="2" width="28" height="20" rx="3.5"/><path d="M3.5 4.5 16 13.5l12.5-9"/></svg>';
  // Turntable: platter with a record (spins while playing) and a tonearm that swings on.
  const TURNTABLE = '<svg class="tt" viewBox="0 0 140 120" aria-hidden="true"><g class="tt-record"><circle cx="58" cy="62" r="45" class="tt-vinyl"/><circle cx="58" cy="62" r="36" class="tt-groove"/><circle cx="58" cy="62" r="27" class="tt-groove"/><path d="M30 44a34 34 0 0 1 22-15" class="tt-shine"/><circle cx="58" cy="62" r="13" class="tt-label"/><circle cx="58" cy="62" r="2.2" class="tt-spindle"/></g><g class="tt-arm"><circle cx="120" cy="22" r="7" class="tt-pivot"/><path d="M120 22 L118 70 L104 84" class="tt-rod"/><rect x="98" y="80" width="11" height="8" rx="2" transform="rotate(-40 103 84)" class="tt-head"/></g><circle cx="122" cy="104" r="5" class="tt-knob"/></svg>';

  /** icon: optional image URL shown after the label (e.g. a logo). */
  /** img: optional picture; 'cutout' shows it die-cut on its own alpha, 'photo' frames it like a print. */
  /** hover: text that replaces the art inside the sticker while it is hovered (see Staging.hoverNotes). */
  function sticker({ shape, label = '', color = 'var(--pop-yellow)', rot = 0, reveal = null, sway = false, swayDelay = 0, icon = null, img = null, hover = null }) {
    const pic = img ? `<img class="d-img" src="${img}" alt="" draggable="false" referrerpolicy="no-referrer">` : '';
    const inner = (shape === 'smile' ? SMILE : shape === 'paper' ? LINES : shape === 'cup' ? CUP : shape === 'turntable' ? TURNTABLE : shape === 'mail' ? ENVELOPE : '') + pic;
    if (icon) label = `${label}<img class="d-icon" src="${icon}" alt="">`;
    const style = `${reveal != null ? `--i:${reveal};` : ''}--r:${rot}deg;--c:${color};--sway-delay:${swayDelay}s`;
    const hk = (hover ? ` data-hk="${Lab.esc(hover)}"` : '') + (shape === 'turntable' ? ' data-tt' : '');
    return `<div class="d-face d-${shape}${sway ? ' is-swaying' : ''}" ${reveal != null ? 'data-reveal' : ''}${hk} style="${style}">
      ${inner}<span class="d-label">${label}</span>${hover ? `<span class="d-hover" aria-hidden="true"><span>${Lab.esc(hover)}</span></span>` : ''}</div>`;
  }

  /* ---------- Pointer ---------- */

  function pointer(sc, el) {
    const p = { x: 0, y: 0, sx: 0, sy: 0, vx: 0, vy: 0, speed: 0, inside: false, down: false, seen: false, last: 0 };
    sc.on(el, 'pointermove', e => {
      const r = el.getBoundingClientRect();
      const nx = e.clientX - r.left, ny = e.clientY - r.top;
      const now = performance.now();
      const dt = Math.max(1, now - p.last);
      if (p.seen) { p.vx = ((nx - p.x) / dt) * 16; p.vy = ((ny - p.y) / dt) * 16; }
      else { p.sx = nx; p.sy = ny; p.seen = true; }
      p.x = nx; p.y = ny; p.inside = true; p.last = now;
    });
    sc.on(el, 'pointerleave', () => { p.inside = false; });
    sc.on(el, 'pointerdown', () => { p.down = true; });
    sc.on(window, 'pointerup', () => { p.down = false; });
    /** Call once per frame. k is the smoothing factor (0 to 1). */
    p.update = (dt, k = 0.2) => {
      const d = Lab.damp(k, dt);
      p.sx = Lab.lerp(p.sx, p.x, d);
      p.sy = Lab.lerp(p.sy, p.y, d);
      p.vx *= 0.85; p.vy *= 0.85;
      p.speed = Math.hypot(p.vx, p.vy);
    };
    return p;
  }

  /* ---------- Options bar ---------- */

  /** groups: [{ id, label, values: [[value, label], ...], value }] */
  /** Concept switches render in the lab's control panel (Kit.optionsHost) when there is one, else on the stage. */
  function options(root, sc, groups, onChange, where = 'top-right') {
    const bar = document.createElement('div');
    const host = Kit.optionsHost;
    bar.className = host ? 'kit-opts is-docked' : `kit-opts kit-${where}`;
    // Group shapes: { heading } a section title; { id, label, range: [min, max, step], unit } a slider;
    // { id, label, values: [[value, label], ...] } a segmented switch.
    bar.innerHTML = groups.map(g => g.heading ? `<h3 class="kit-opt-head">${g.heading}</h3>` : g.range ? `
      <label class="kit-opt kit-range">
        <span>${g.label}<output>${g.value}${g.unit || ''}</output></span>
        <input type="range" min="${g.range[0]}" max="${g.range[1]}" step="${g.range[2] || 1}" value="${g.value}" data-range="${g.id}">
      </label>` : `
      <div class="kit-opt">
        <span>${g.label}</span>
        <div class="seg" role="radiogroup" aria-label="${g.label}" data-group="${g.id}">
          ${g.values.map(([v, l]) => `<button role="radio" data-value="${v}" aria-checked="${v === g.value}">${l}</button>`).join('')}
        </div>
      </div>`).join('');
    sc.on(bar, 'input', e => {
      const r = e.target.closest('input[data-range]');
      if (!r) return;
      const g = groups.find(x => x.id === r.dataset.range);
      g.value = Number(r.value);
      r.previousElementSibling.querySelector('output').textContent = `${g.value}${g.unit || ''}`;
      onChange(g.id, g.value);
    });
    sc.on(bar, 'click', e => {
      const btn = e.target.closest('button[data-value]');
      if (!btn) return;
      const id = btn.parentElement.dataset.group;
      btn.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b === btn)));
      groups.find(g => g.id === id).value = btn.dataset.value;
      onChange(id, btn.dataset.value);
    });
    sc.on(bar, 'pointerdown', e => e.stopPropagation());
    (host || root).appendChild(bar);
    if (host) sc.add(() => bar.remove());
    return bar;
  }

  /* ---------- Cursor-off notice ---------- */

  function cursorOff(root, m) {
    if (m.types.cursor) return false;
    const n = document.createElement('div');
    n.className = 'kit-notice';
    n.innerHTML = m.reduced
      ? 'Your OS asks for reduced motion, so cursor effects are off. This is the fallback visitors would see.'
      : 'Cursor effects are off. Turn on <b>Cursor reactive</b> in the levers (and keep Intensity above 0).';
    root.appendChild(n);
    return true;
  }

  /* ---------- Specimen layout ---------- */

  function specimen(c, { cursorLabels = false } = {}) {
    const lab = (text) => (cursorLabels ? ` data-cursor="${text}"` : '');
    return `
      <div class="sp">
        <header class="sp-top">
          <span class="sp-mark">${Lab.esc(Lab.initials(c.name))}</span>
          <nav class="sp-nav" aria-label="Primary">
            ${Lab.NAV.map(n => `<a href="#${n.id}" class="sp-link" data-go="${n.id}" data-magnet${lab('Open ' + n.label)}><span>${n.label}</span></a>`).join('')}
          </nav>
        </header>
        <div class="sp-hero">
          <p class="sp-kicker">${Lab.esc(c.role)}</p>
          <h1 class="sp-name"${lab('Hello')}>${Lab.esc(c.name)}</h1>
          <p class="sp-tag" data-cursor-text>${Lab.esc(c.tagline)}</p>
          <div class="sp-actions">
            <a href="#work" class="sp-btn sp-btn-primary" data-go="work" data-magnet${lab('See work')}><span>See selected work</span></a>
            <button class="sp-btn" data-copy data-magnet${lab('Copy email')}><span>${Lab.esc(c.email)}</span></button>
          </div>
        </div>
        <div class="sp-cards">
          ${['Project One', 'Project Two', 'Project Three'].map((p, i) => `
            <a href="#work" class="sp-card" data-go="work"${lab('View case study')}>
              <span class="sp-thumb" style="--h:${(i * 70 + 210) % 360}"></span>
              <b>${p}</b><span>Case study · ${2026 - i}</span>
            </a>`).join('')}
        </div>
      </div>`;
  }

  /** Wire the specimen's copy-email button. */
  function wireSpecimen(root, sc, c, toast) {
    const btn = root.querySelector('[data-copy]');
    if (!btn) return;
    sc.on(btn, 'click', async () => {
      try { await navigator.clipboard.writeText(c.email); } catch { /* clipboard blocked */ }
      toast(`Copied ${c.email}`);
    });
  }

  /* ---------- Tossable physics ---------- */

  /**
   * items: [{ el, face?, x, y, w?, h?, r?, home?, mass? }]
   * opts:  { gravity, bounce, friction, collide, tilt, edge, onDrop(item) }
   *   gravity: number (down) or (motion) => ({ x, y }) for any direction
   *   edge: fraction of an item allowed past the walls (0 keeps it fully inside)
   *   draggable: false makes items move only by physics (no pointer handling)
   */
  function tossable(sc, motion, container, items, opts = {}) {
    const o = { gravity: 0, bounce: 0.55, friction: 0.9, collide: false, tilt: true, edge: 0.3, onDrop: null, draggable: true, ...opts };
    let z = 10;

    items.forEach(it => {
      it.vx = 0; it.vy = 0; it.tilt = 0; it.held = false; it.returning = false;
      it.face = it.face || it.el.firstElementChild;
      it.w = it.w || it.el.offsetWidth;
      it.h = it.h || it.el.offsetHeight;
      it.r = it.r || ((it.w + it.h) / 4) * 0.86;
      it.home = it.home || { x: it.x, y: it.y };
      it.el.style.translate = `${it.x}px ${it.y}px`;
      if (o.draggable) wireDrag(it);
    });

    function wireDrag(it) {
      let offX = 0, offY = 0, sx = 0, sy = 0, lx = 0, ly = 0, lt = 0, moved = 0;
      sc.on(it.el, 'pointerdown', e => {
        if (e.button > 0) return;
        e.preventDefault();
        e.stopPropagation();
        it.el.setPointerCapture(e.pointerId);
        const r = container.getBoundingClientRect();
        it.held = true; it.returning = false; it.vx = it.vy = 0; moved = 0;
        it.el.style.zIndex = ++z;
        it.el.classList.add('is-held');
        it.el.dataset.dragged = 'false';
        sx = lx = e.clientX; sy = ly = e.clientY; lt = performance.now();
        offX = e.clientX - r.left - it.x; offY = e.clientY - r.top - it.y;
      });
      sc.on(it.el, 'pointermove', e => {
        if (!it.held) return;
        const r = container.getBoundingClientRect();
        const now = performance.now(), dt = Math.max(1, now - lt);
        it.vx = ((e.clientX - lx) / dt) * 16;
        it.vy = ((e.clientY - ly) / dt) * 16;
        lx = e.clientX; ly = e.clientY; lt = now;
        moved = Math.max(moved, Math.hypot(e.clientX - sx, e.clientY - sy));
        if (moved > 5) it.el.dataset.dragged = 'true';
        it.x = e.clientX - r.left - offX;
        it.y = e.clientY - r.top - offY;
      });
      const release = () => {
        if (!it.held) return;
        it.held = false;
        it.el.classList.remove('is-held');
        if (motion().intensity === 0) it.vx = it.vy = 0;
        if (moved > 5) o.onDrop?.(it);
        setTimeout(() => { it.el.dataset.dragged = 'false'; }, 0);
      };
      sc.on(it.el, 'pointerup', release);
      sc.on(it.el, 'pointercancel', release);
      sc.on(it.el, 'keydown', e => {
        if ((e.key === 'Enter' || e.key === ' ') && it.el.dataset.go) { e.preventDefault(); it.el.click(); }
      });
    }

    function step(s, mo, W, H, forceGravity = false) {
      // gravity: a number (pulls down) or a function returning {x, y} for any direction.
      const gv = typeof o.gravity === 'function' ? o.gravity(mo) : { x: 0, y: o.gravity };
      const still = !forceGravity && mo.intensity === 0;
      const gx = still ? 0 : gv.x, gy = still ? 0 : gv.y;
      const hasG = gx !== 0 || gy !== 0;
      const air = Math.pow(hasG ? 0.995 : o.friction, s);
      for (const it of items) {
        if (it.held) continue;
        if (it.returning) {
          const k = 1 - Math.pow(1 - 0.12, s);
          it.x = Lab.lerp(it.x, it.home.x, k);
          it.y = Lab.lerp(it.y, it.home.y, k);
          it.vx = it.vy = 0;
          if (Math.hypot(it.x - it.home.x, it.y - it.home.y) < 0.5) {
            it.x = it.home.x; it.y = it.home.y; it.returning = false;
          }
          continue;
        }
        it.vx += gx * s;
        it.vy += gy * s;
        it.x += it.vx * s;
        it.y += it.vy * s;
        it.vx *= air; it.vy *= air;
        // With gravity the walls are hard; without it, items may hang a little past the edge.
        const ex = hasG ? 0 : it.w * o.edge, ey = hasG ? 0 : it.h * o.edge;
        // An open ceiling lets things rain in from above when gravity points down.
        const ceiling = !hasG || gy < 0.1;
        if (it.x < -ex)            { it.x = -ex;            it.vx = Math.abs(it.vx) * o.bounce; if (gx < 0) it.vy *= Math.pow(0.86, s); }
        if (it.x > W - it.w + ex)  { it.x = W - it.w + ex;  it.vx = -Math.abs(it.vx) * o.bounce; if (gx > 0) it.vy *= Math.pow(0.86, s); }
        if (ceiling && it.y < -ey) { it.y = -ey;            it.vy = Math.abs(it.vy) * o.bounce; if (gy < 0) it.vx *= Math.pow(0.86, s); }
        if (it.y > H - it.h + ey) {
          it.y = H - it.h + ey;
          it.vy = -Math.abs(it.vy) * o.bounce;
          if (Math.abs(it.vy) < 1) it.vy = 0;
          if (gy > 0) it.vx *= Math.pow(0.86, s);
        }
      }
      if (o.collide) {
        for (let pass = 0; pass < 3; pass++) {
          for (let i = 0; i < items.length; i++) {
            for (let j = i + 1; j < items.length; j++) {
              const a = items[i], b = items[j];
              if (a.held && b.held) continue;
              const dx = b.x + b.w / 2 - (a.x + a.w / 2);
              const dy = b.y + b.h / 2 - (a.y + a.h / 2);
              const dist = Math.hypot(dx, dy) || 0.01;
              const min = a.r + b.r;
              if (dist >= min) continue;
              const nx = dx / dist, ny = dy / dist, overlap = min - dist;
              // Heavier items get pushed less. Held or returning items do not get pushed at all.
              const ma = a.mass || 1, mb = b.mass || 1;
              const wa = a.held || a.returning ? 0 : b.held || b.returning ? 1 : mb / (ma + mb);
              const wb = b.held || b.returning ? 0 : a.held || a.returning ? 1 : ma / (ma + mb);
              a.x -= nx * overlap * wa; a.y -= ny * overlap * wa;
              b.x += nx * overlap * wb; b.y += ny * overlap * wb;
              const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
              if (rv < 0) {
                const jj = (-(1 + 0.3) * rv) / 2;
                // Impulse is shared by mass too; equal masses each take the full jj, as before.
                const ka = Math.min(1, 2 * wa), kb = Math.min(1, 2 * wb);
                a.vx -= jj * nx * ka; a.vy -= jj * ny * ka;
                b.vx += jj * nx * kb; b.vy += jj * ny * kb;
              }
            }
          }
        }
      }
    }

    function render(s, mo) {
      for (const it of items) {
        it.el.style.translate = `${it.x}px ${it.y}px`;
        if (o.tilt && it.face) {
          const target = Lab.clamp(it.vx * 1.6, -25, 25) * mo.intensity;
          it.tilt = Lab.lerp(it.tilt, target, 1 - Math.pow(0.8, s));
          it.face.style.setProperty('--tilt', `${it.tilt.toFixed(2)}deg`);
        }
      }
    }

    let last = performance.now();
    sc.frame(now => {
      const mo = motion();
      const s = Math.min(3, ((now - last) / 16.67) * mo.speed);
      last = now;
      step(s, mo, container.clientWidth, container.clientHeight);
      render(s, mo);
    });

    return {
      items,
      /** Run the simulation instantly, e.g. to pre-settle a pile. */
      settle(steps = 240) {
        const mo = motion();
        for (let i = 0; i < steps; i++) step(1, mo, container.clientWidth, container.clientHeight, true);
        render(1, mo);
      },
      /** Send everything back to its home position. */
      home() {
        const instant = motion().intensity === 0;
        items.forEach(it => {
          if (instant) { it.x = it.home.x; it.y = it.home.y; it.vx = it.vy = 0; }
          else it.returning = true;
        });
      },
      /** Throw every item with a random impulse. */
      kick(power = 18) {
        items.forEach(it => {
          it.returning = false;
          it.vx += (Math.random() - 0.5) * power;
          it.vy -= Math.random() * power;
        });
      },
    };
  }

  /* ---------- Camera ---------- */

  /**
   * opts: { x, y, z, minZ, maxZ, bounds: {x:[min,max], y:[min,max]} | null,
   *         wheel: 'pan' | 'zoom', ignore: selector, onFrame(cam, dt, mo) }
   */
  function camera(sc, motion, view, opts = {}) {
    const o = { x: 0, y: 0, z: 1, minZ: 1, maxZ: 1, bounds: null, wheel: 'pan', ignore: '', onFrame: null, ...opts };
    const cam = { x: o.x, y: o.y, z: o.z, vx: 0, vy: 0, anim: null, dragging: false, justDragged: false };
    let drag = null;

    cam.toWorld = (px, py) => ({
      x: cam.x + (px - view.clientWidth / 2) / cam.z,
      y: cam.y + (py - view.clientHeight / 2) / cam.z,
    });

    cam.animateTo = (x, y, z = cam.z, base = 700) => {
      const mo = motion();
      z = Lab.clamp(z, o.minZ, o.maxZ);
      if (mo.intensity === 0) { Object.assign(cam, { x, y, z, vx: 0, vy: 0, anim: null }); return; }
      cam.anim = { from: { x: cam.x, y: cam.y, z: cam.z }, to: { x, y, z }, start: performance.now(), dur: mo.ms(base) };
      cam.vx = cam.vy = 0;
    };

    cam.zoomAt = (px, py, factor) => {
      const before = cam.toWorld(px, py);
      cam.z = Lab.clamp(cam.z * factor, o.minZ, o.maxZ);
      cam.x = before.x - (px - view.clientWidth / 2) / cam.z;
      cam.y = before.y - (py - view.clientHeight / 2) / cam.z;
    };

    sc.on(view, 'pointerdown', e => {
      if (e.button > 0 || (o.ignore && e.target.closest(o.ignore))) return;
      drag = { sx: e.clientX, sy: e.clientY, x: cam.x, y: cam.y, lx: e.clientX, ly: e.clientY, lt: performance.now(), moved: 0, id: e.pointerId };
      cam.anim = null; cam.vx = cam.vy = 0;
    });
    sc.on(view, 'pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
      if (drag.moved <= 4) return;
      if (!view.hasPointerCapture(drag.id)) { view.setPointerCapture(drag.id); view.classList.add('is-panning'); cam.dragging = true; }
      const now = performance.now(), dt = Math.max(1, now - drag.lt);
      cam.vx = (-(e.clientX - drag.lx) / cam.z / dt) * 16;
      cam.vy = (-(e.clientY - drag.ly) / cam.z / dt) * 16;
      drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = now;
      cam.x = drag.x - dx / cam.z;
      cam.y = drag.y - dy / cam.z;
    });
    const end = e => {
      if (!drag) return;
      if (drag.moved > 4) {
        cam.justDragged = true;
        const link = e.target.closest?.('[data-go]');
        if (link) link.dataset.dragged = 'true';
        setTimeout(() => { cam.justDragged = false; if (link) link.dataset.dragged = 'false'; }, 0);
      }
      if (motion().intensity === 0) cam.vx = cam.vy = 0;
      view.classList.remove('is-panning');
      cam.dragging = false;
      drag = null;
    };
    sc.on(view, 'pointerup', end);
    sc.on(view, 'pointercancel', end);
    sc.on(view, 'wheel', e => {
      if (o.ignore && e.target.closest(o.ignore)) return;
      e.preventDefault();
      cam.anim = null;
      const r = view.getBoundingClientRect();
      if ((o.wheel === 'zoom' || e.ctrlKey) && o.maxZ > o.minZ) {
        cam.zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0022)));
      } else {
        cam.x += e.deltaX / cam.z;
        cam.y += e.deltaY / cam.z;
      }
    }, { passive: false });

    let last = performance.now();
    sc.frame(now => {
      const mo = motion();
      const dt = now - last; last = now;
      if (cam.anim) {
        const a = cam.anim;
        const p = Lab.clamp((now - a.start) / a.dur, 0, 1);
        const k = mo.ease(p);
        // Interpolate zoom in log space so fly-throughs feel even.
        cam.z = Math.exp(Lab.lerp(Math.log(a.from.z), Math.log(a.to.z), k));
        cam.x = Lab.lerp(a.from.x, a.to.x, k);
        cam.y = Lab.lerp(a.from.y, a.to.y, k);
        if (p === 1) cam.anim = null;
      } else if (!drag || drag.moved <= 4) {
        const s = (dt / 16.67) * mo.speed;
        const f = Math.pow(0.92, s);
        cam.x += cam.vx * s; cam.y += cam.vy * s;
        cam.vx *= f; cam.vy *= f;
      }
      if (o.bounds) {
        cam.x = Lab.clamp(cam.x, o.bounds.x[0], o.bounds.x[1]);
        cam.y = Lab.clamp(cam.y, o.bounds.y[0], o.bounds.y[1]);
      }
      o.onFrame?.(cam, dt, mo);
    });

    return cam;
  }

  /* ---------- Colors for <canvas> ---------- */

  /** Resolve a CSS color (including var() and light-dark()) to a concrete value. */
  function color(el, value) {
    const probe = document.createElement('span');
    probe.style.cssText = `display:none; color:${value}`;
    el.appendChild(probe);
    const out = getComputedStyle(probe).color;
    probe.remove();
    return out;
  }

  /** Canvas sized to its element at device pixel ratio; returns ctx and size. */
  function canvas2d(sc, cv) {
    const ctx = cv.getContext('2d');
    const size = { w: 0, h: 0 };
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size.w = cv.clientWidth; size.h = cv.clientHeight;
      cv.width = Math.round(size.w * dpr); cv.height = Math.round(size.h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size.onResize?.();
    };
    fit();
    sc.observe(cv, fit);
    return { ctx, size };
  }

  /* ---------- Element pool for endless layouts ---------- */

  /**
   * Reuse DOM nodes frame to frame. Call begin(), then next() for every item
   * you need this frame, then end() to hide the leftovers.
   * make() creates a fresh element; each element gets a `key` slot so callers
   * can skip content updates when nothing changed.
   */
  function pool(container, make) {
    const els = [];
    let i = 0;
    return {
      begin() { i = 0; },
      next() {
        if (i === els.length) { const el = make(); el.key = ''; container.appendChild(el); els.push(el); }
        const el = els[i++];
        if (el.hidden) el.hidden = false;
        return el;
      },
      end() { for (let j = i; j < els.length; j++) if (!els[j].hidden) els[j].hidden = true; },
    };
  }

  const mod = (n, d) => ((n % d) + d) % d;
  /** Small deterministic hash for picking content by grid coordinates. */
  const hash = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return (h ^ (h >>> 16)) >>> 0; };

  // optionsHost: set by the lab controller to dock concept switches in its panel.
  window.Kit = { optionsHost: null, sticker, pointer, options, cursorOff, specimen, wireSpecimen, tossable, camera, color, canvas2d, pool, mod, hash };
})();
