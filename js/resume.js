/* ==========================================================================
   Resume page (#/resume). Native to the site: built from SITE.resume in
   content.js (edit your resume there, not here), on the Work page's Gouache
   paper. Download uses SITE.resume.pdf when set, else the browser's Save as
   PDF with a clean print layout (css/resume.css).
   ========================================================================== */

window.Resume = (function () {
  const esc = Lab.esc;
  // The desk's tea cup, as on the Work page: goes home.
  const CUP = '<svg viewBox="0 0 48 44" aria-hidden="true"><path d="M8 18h26v8a11 11 0 0 1-11 11h-4A11 11 0 0 1 8 26Z"/><path d="M34 21h3a5 5 0 0 1 0 10h-4"/><path d="M5 40h34"/><path d="M16 4c-2 3 2 5 0 8M23 3c-2 3 2 5 0 8M30 4c-2 3 2 5 0 8"/></svg>';
  const ICONS = {
    download: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v10M5.5 8.5 10 13l4.5-4.5M4 16.5h12"/></svg>',
    linkedin: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="2.5" width="15" height="15" rx="3"/><path d="M6.5 8.5v5M6.5 6v.01M9.5 13.5v-5M9.5 10.5a2 2 0 0 1 4 0v3"/></svg>',
    medium: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="6.5" cy="10" r="4"/><ellipse cx="13.5" cy="10" rx="1.8" ry="3.8"/><path d="M17.5 6.5v7"/></svg>',
    email: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="4.5" width="15" height="11" rx="2.5"/><path d="M3.5 6l6.5 5 6.5-5"/></svg>',
  };

  function mount(root, api) {
    const { profile, resume: r } = window.SITE;
    const pdf = r.pdf
      ? `<a class="rs-btn rs-btn-main" href="${esc(r.pdf)}" download target="_blank" rel="noopener">${ICONS.download}<span>Download PDF</span></a>`
      : `<button class="rs-btn rs-btn-main" type="button" data-print>${ICONS.download}<span>Download PDF</span></button>`;
    const section = (title, body) => body ? `<section class="rs-sec"><h2>${title}</h2>${body}</section>` : '';

    // Gouache.frame gives the Work page's paper, brush filters, and wobble, so both pages match.
    Gouache.frame(root, api.scope, 'rs', `
        <header class="rs-top">
          <button class="gwx-home" data-go="home" aria-label="Home" title="Home">${CUP}</button>
          <nav class="rs-actions" aria-label="Resume actions and links">
            ${pdf}
            <a class="rs-icon" href="${esc(profile.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn" title="LinkedIn">${ICONS.linkedin}</a>
            <a class="rs-icon" href="${esc(profile.medium)}" target="_blank" rel="noopener" aria-label="Medium" title="Medium">${ICONS.medium}</a>
            <button class="rs-icon" type="button" data-go="email" aria-label="Copy email address" title="Copy ${esc(profile.email)}">${ICONS.email}</button>
          </nav>
        </header>
        <article class="rs-page">
          <header class="rs-head">
            <h1>${esc(profile.name)}</h1>
            <p class="rs-print-only">${esc(profile.email)} · ${esc(profile.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</p>
          </header>
          ${section('Experience', r.experience.map(j => `
            <div class="rs-job">
              <div class="rs-row"><h3>${esc(j.title)}</h3><span class="rs-dates">${esc(j.dates)}</span></div>
              <ul>${j.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
            </div>`).join(''))}
          ${section('Education', r.education.map(e => `<div class="rs-row rs-edu"><h3>${esc(e.school)}</h3><span>${esc(e.detail)}</span></div>`).join(''))}
          ${section('Recommendations', r.recommendations.map(q => `<blockquote><p>“${esc(q.quote)}”</p><cite>${esc(q.by)}</cite></blockquote>`).join(''))}
          ${section('Certifications', r.certifications.length ? `<ul class="rs-plain">${r.certifications.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : '')}
        </article>`);

    api.scope.on(root, 'click', e => { if (e.target.closest('[data-print]')) window.print(); });
  }

  return { id: 'resume', mount };
})();
