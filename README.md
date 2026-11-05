# Sneha Sundar · personal site

A static site with no build step. Host this folder as is (GitHub Pages: push it to the repository root and turn on Pages for the main branch).

- **Home** (`#/`): the interactive Gouache desk. Drag the stickers; the circle shows the pencil sketch underneath.
- **Work** (`#/work`): case studies and methodology. Two case studies are password protected and ship encrypted.
- **About** (`#/about`): a postcard with the About copy on the left and a dress-up shuffle machine on the right (pull the lever to switch personas).

## Editing your content

**Open `content.js`.** It holds everything you would normally change: your name, role, email, LinkedIn and Medium links, the pictures (in `images/`), and the whole resume (jobs, bullets, education, recommendations, certifications, and the PDF link). The comments at the top explain how to add a bullet or a job. On GitHub: open the file, click the pencil, edit, commit.

- **Resume** (`#/resume`): built from `content.js`. Download PDF uses `resume.pdf` when set, else the browser's Save as PDF.

## Files

- `content.js`: your content (see above).
- `index.html`, `js/site.js`, `css/site.css`, `js/resume.js`, `css/resume.css`: the site's own files.
- Everything else in `css/` and `js/` is copied from the design lab. Change those in the lab and re-copy them (`node tools/build-site.mjs` in the lab folder) instead of editing them here.
- `images/`: your pictures. `images/web/` holds resized copies of the big ones (the originals are too heavy to load).
