# aimanhazim.com

Plain HTML, CSS and JS. No build step, no framework, no trackers. Fonts are self-hosted. English only.

## Preview

    cd aimanhazim.com
    python3 -m http.server 8011

Then open http://localhost:8011. Use a server, not file://, because the links start with /.

## Add content

Everything you add regularly lives in `assets/data/`. Open the file, copy a block, edit it, save. Each file has a short note at the top. All text is plain English strings.

- Projects: `assets/data/projects.js`. Newest or most important first. The page numbers them 01, 02, ... in that order.
- Writing: `assets/data/writing.js`. `date` is "YYYY-MM-DD" and becomes the anchor (writing.html#2026-06-10). `body` is a list of paragraphs.
- Log: `assets/data/log.js`. Same shape as writing. Shows on progress.html.
- Photos: put the file in `assets/img/photos/`, then add a block to `assets/data/photos.js` with its width and height. While the list is empty the page says "More soon."

Other words (nav, home, about) are written straight into each page's HTML.

## Look

- `assets/css/style.css`: colours are CSS variables at the top. One accent (amber).
- `assets/js/robot.js`: the walking robot on the home and 404 pages. A small four-legged walker with a sensor head on a mast and an antenna, drawn as points on a grid of cells. Move the pointer and the head follows; click or tap and it sends a ping. It pauses when the tab is hidden and shows a still frame for reduced motion.
- `assets/js/thermal.js`: the simulator scenes on the PyroScout write-up.
- `assets/js/site.js`: theme, menu, footer clock, and the lists built from `assets/data/`.

## A new page

Copy a folder like `research/` (its `index.html`), change the title, the text and the `aria-current` link in the nav, and add the URL to `sitemap.xml`. Keep the icon and theme-color tags in the head as they are.

## Icons

- `favicon.svg`: the main tab icon. It switches colours with the light or dark browser scheme.
- `favicon.ico`: 16, 32 and 48 px, for browsers that skip SVG.
- `assets/img/apple-touch-icon.png`: 180 px, for iOS home screens.
- `assets/img/icon-192.png`, `icon-512.png` and the `icon-maskable-*` pair: listed in `site.webmanifest`.

## Files to keep

CNAME, robots.txt, sitemap.xml, .nojekyll, site.webmanifest, the icon files above and `assets/img/og-card.png`.
