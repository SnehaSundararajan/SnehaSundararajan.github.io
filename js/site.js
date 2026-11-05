/* ==========================================================================
   Site runtime. The website's stand-in for the lab's lab.js: no panel, no
   levers. It applies the signed-off settings, mounts one page per hash route,
   and turns data-go links into real navigation.
     #/       Home: the Gouache desk (lab Staging iteration 06)
     #/work   Work: case studies and methodology (lab Work v8, gw-work)
     #/about  About: the postcard with the persona shuffle machine (lab About v4, dress-personas)
     #/resume Resume: built from content.js (js/resume.js)
   Your info, pictures, and resume text live in content.js (window.SITE).
   Hash routes need no server rules, so the folder can be hosted as is.
   ========================================================================== */

(function () {
  const home = Lab.registry.staging.find(c => c.id === 'it6');
  const work = Lab.registry.work.find(c => c.id === 'gw-work');
  const about = Lab.registry.about.find(c => c.id === 'dress-personas');
  const ROUTES = {
    '': { concept: home, title: 'Sneha Sundar · designer · researcher · builder' },
    work: { concept: work, title: 'Work · Sneha Sundar' },
    about: { concept: about, title: 'About · Sneha Sundar' },
    resume: { concept: Resume, title: 'Resume · Sneha Sundar' },
  };
  // Stickers whose pages are not ready yet stay off the desk. The resume page exists (#/resume) but its
  // sticker is held back for now; empty this list to bring it back.
  const HIDDEN = ['resume'];
  // Lab defaults, overridden by content.js: name, role, email, links, and the site's own pictures.
  const content = () => ({ ...Lab.state.content, ...SITE.profile, images: SITE.images, hidden: HIDDEN });

  // Lab-only switches (e.g. the reader's Color dots) render into a host that is never on the page.
  Kit.optionsHost = document.createElement('div');

  // The signed-off look: iteration 04's motion levers and the Paper brand.
  Lab.set(structuredClone(home.snapshot));

  const stage = document.getElementById('stage');
  const toastEl = document.getElementById('toast');
  let toastTimer, current = null;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 1800);
  }

  function go(section) {
    const c = content();
    if (section === 'work') location.hash = '#/work';
    else if (section === 'home') location.hash = '#/';
    else if (section === 'linkedin') window.open(c.linkedin, '_blank', 'noopener');
    // Email copies the address instead of opening a mail app.
    else if (section === 'email') navigator.clipboard?.writeText(c.email).then(() => toast('Email address copied'), () => toast(c.email)) ?? toast(c.email);
    else if (section === 'about') location.hash = '#/about';
    else if (section === 'resume') location.hash = '#/resume';
  }

  function mount() {
    const key = location.hash.replace(/^#\/?/, '');
    const route = ROUTES[key] || ROUTES[''];
    // The shared home button (top left of the frame) shows on every page but Home.
    document.body.dataset.route = ROUTES[key] ? key : '';
    current?.dispose();
    stage.innerHTML = '';

    const m = Lab.motion();
    stage.dataset.entrance = m.types.entrance ? 'on' : 'off';
    stage.dataset.ambient = m.types.ambient ? 'on' : 'off';
    stage.dataset.hover = m.types.hover ? 'on' : 'off';

    const root = document.createElement('div');
    root.className = `concept-root c-${route.concept.id}`;
    stage.appendChild(root);

    const sc = Lab.scope();
    // fit: the desk's stickers grow with the window and sit a little closer (lab previews stay as signed off).
    route.concept.mount(root, { scope: sc, content: content(), motion: Lab.motion, stage, go, toast, fit: true });
    sc.on(root, 'click', e => {
      const link = e.target.closest('[data-go]');
      // A sticker that was just dragged is not a click.
      if (!link || link.dataset.dragged === 'true') return;
      e.preventDefault();
      go(link.dataset.go);
    });
    document.title = route.title;
    current = sc;
  }

  // Light/dark switch, top right: shows the moon in light mode and the sun in dark mode.
  // The choice is saved (Lab state); until a visitor picks, the page follows their OS.
  const themeBtn = document.getElementById('themeBtn');
  const syncTheme = () => {
    const dark = Lab.resolvedTheme() === 'dark';
    themeBtn.dataset.mode = dark ? 'dark' : 'light';
    const label = `Switch to ${dark ? 'light' : 'dark'} mode`;
    themeBtn.setAttribute('aria-label', label);
    themeBtn.title = label;
  };
  themeBtn.addEventListener('click', () => Lab.set({ theme: Lab.resolvedTheme() === 'dark' ? 'light' : 'dark' }));
  Lab.subscribe((st, changed) => { if (changed.includes('theme')) syncTheme(); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncTheme);
  syncTheme();

  document.getElementById('homeBtn').addEventListener('click', () => go('home'));
  window.addEventListener('hashchange', mount);
  mount();
})();
