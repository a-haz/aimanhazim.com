# aimanhazim.com

Plain HTML, CSS and JS. No build step, no framework, no trackers. Fonts are self-hosted. English only.

## Preview

    cd aimanhazim.com
    python3 -m http.server 8011

Then open http://localhost:8011. Use a server, not file://, because the links start with /.

## Add content

Everything you add regularly lives in `assets/data/`. Open the file, copy a block, edit it, save. Each file has a short note at the top. All text is plain English strings.

- Projects (research included): `assets/data/projects.js`. Newest or most important first. The page numbers them 01, 02, ... in that order. Add `tag: "research"` to show a small research label.
- Writing: `assets/data/writing.js`. `date` is "YYYY-MM-DD" and becomes the anchor (writing.html#2026-06-10). `body` is a list of paragraphs.
- Gallery (/gallery/): `assets/data/gallery.js`. Newest first. While the list is empty the page says "More soon."
  - A photo: put the file in `assets/img/gallery/`, then add a block with `type: "image"`, `src`, `w` and `h` (its size), `alt`, and optional `caption` and `date` ("YYYY-MM").
  - A video: put an mp4 (H.264) in `assets/video/`, plus a poster image in `assets/img/gallery/`. Add a block with `type: "video"`, `src`, `poster`, `w`, `h`, `alt`, and optional `webm` (a second source), `loop`, `caption` and `date`. Videos are self-hosted, muted, play inline, and load nothing until played (`preload="none"`), so the poster shows first. Keep clips short and small (a few MB); GitHub Pages refuses files over 100 MB.

Other words (nav, home, about) are written straight into each page's HTML.

## Look

- `assets/css/style.css`: colours are CSS variables at the top. One accent (amber).
- `assets/js/robot.js`: the walking robot on the home and 404 pages. A four-legged walker with a sensor head on a mast and an antenna, drawn as points on a grid of cells. It roams freely: it walks under the text (fading there so the words stay readable) and now and then off the edge of the screen, and its patch of floor goes with it. Move the pointer over the floor and it comes after it at once; click or tap and it sends a ping and walks there. The camera stays put by default; put `data-camera="follow"` on the canvas (or add `?cam=follow` to the URL to try it) and the view follows the robot instead, keeping it right of the text while the floor slides along. It pauses when the tab is hidden and shows a still frame for reduced motion.
- `assets/js/thermal.js`: the simulator scenes on the PyroScout write-up.
- `assets/js/site.js`: theme, menu, footer clock, and the lists built from `assets/data/`. The theme follows the system light or dark setting (iOS, Android, macOS, Windows), also when it changes while the page is open. The sun/moon toggle saves a choice that wins over it; toggling back to the system's own theme clears the choice. The small script at the top of each page's head does the first pick, before anything is drawn.

## A new page

Copy a folder like `about/` (its `index.html`), change the title, the text and the `aria-current` link in the nav, and add the URL to `sitemap.xml`. Keep the icon and theme-color tags in the head as they are.

## Icons

- `favicon.svg`: the main tab icon. It switches colours with the light or dark browser scheme.
- `favicon.ico`: 16, 32 and 48 px, for browsers that skip SVG.
- `assets/img/apple-touch-icon.png`: 180 px, for iOS home screens.
- `assets/img/icon-192.png`, `icon-512.png` and the `icon-maskable-*` pair: listed in `site.webmanifest`.

## Old URLs

`/progress.html` (the old log), `/research/` and `/photos/` are tiny noindex pages that send you on to `/`, `/projects/` and `/gallery/`. Keep them so old links do not break.

## Files to keep

CNAME, robots.txt, sitemap.xml, .nojekyll, site.webmanifest, the icon files above and `assets/img/og-card.png`.
