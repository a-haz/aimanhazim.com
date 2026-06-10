# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`aimanhazim.com` — a personal portfolio site. **Static, no build step, no framework, no
tests/lint.** Plain HTML + CSS + a little vanilla JS, served by **GitHub Pages** from `main`
(custom domain via `CNAME`). Don't look for a package.json, bundler, or test runner — there
are none.

## Commands

```bash
# Local preview — MUST be over HTTP, not file://
python3 -m http.server 8000        # then open http://localhost:8000
# (pages use absolute /assets/... paths and render content via JS, so opening
#  an .html file directly shows a blank/broken page.)

# Deploy = push to main; GitHub Pages publishes to https://aimanhazim.com automatically.
git push origin main
```

There is nothing to build, compile, or test.

## Architecture — the site renders itself from JS data

The `.html` files are **skeletons**: empty containers + `[data-i18n]` hooks. Almost all
visible content is injected at runtime by `assets/js/app.js` from two global objects:

- `window.SITE_CONTENT` (in `assets/js/content.js`) — every word on the main page, as three
  parallel language blocks: **`en`, `ja`, `ms`**. Each has the same sections (`nav`, `hero`,
  `learning`, `about`, `research`, `now`, `skills`, `projects`, `contact`, `footer`,
  `progressPage`, `ui`).
- `window.PROGRESS_ENTRIES` (in `assets/js/progress.js`) — the Build Log entries (newest first).

**Consequence: to change page text or content, edit `content.js` / `progress.js`, NOT the HTML.**
See `README.md` for the per-field editing recipes.

`app.js` (an IIFE) is the engine:
- Picks the active language (`localStorage` → else `DEFAULT_LANG = "en"`) and resolves text via
  `[data-i18n="dotted.path"]`, `[data-i18n-html]`, `[data-i18n-attr="attr:path; ..."]`. A missing
  key falls back to the `en` block — so a new entry only strictly needs the `en` text.
- Builds DOM with a small `el(tag, attrs, kids)` helper inside `render*` functions
  (`renderNav`, `renderHero`, `renderProjects`, `renderProgress`, …). To add/change a *kind* of
  element (e.g. a new field on a project card), edit the matching `render*` function **and** the
  data shape in `content.js` together.
- `.reveal` elements are faded in on scroll via `IntersectionObserver` (skipped under
  `prefers-reduced-motion`). New JS-built blocks usually get `class="… reveal"`.

`progress.js` only populates `progress.html`; `app.js` + `content.js` drive every page.

## Theming (two-layer CSS)

- **`assets/css/style.css`** is the base theme. All colors/spacing are CSS custom properties in
  `:root` (dark) and `[data-theme="light"]`; changing `--accent` re-skins everything. Theme is
  persisted to `localStorage["ah-theme"]` and applied pre-paint by a small inline script in each
  page's `<head>` (to avoid a flash).
- **`assets/css/refined.css`** is an **override layer loaded *after* `style.css`** on every page —
  it is the current live look ("field-telemetry": the LiDAR-radar + robot-blueprint ambient
  background motifs, numbered sections, HUD details, tighter spacing). The base file stays pristine;
  the overlay can be reverted by removing its `<link>`. **Design explorations follow this pattern**:
  a new `assets/css/<name>.css` linked after `style.css`, developed on an `explore/<name>` branch
  (e.g. `explore/cyberpunk`), never editing the base. Verify visual work by screenshotting the
  local HTTP server with headless Chrome and a tall `--window-size` (so the IntersectionObserver
  reveals off-screen `.reveal` sections).

## Standalone sub-pages (not content-driven)

- `projects/pyroscout/index.html` — a self-contained exported Jupyter write-up (~8 MB, inline
  base64 figures). Hand-edited HTML, not part of the `content.js` system.
- `compare/before/index.html` — a temporary theme A/B snapshot that loads its own copy of an older
  `refined.css`. `compare/*` is intentionally `noindex` and excluded from the sitemap.

## Deploy gotchas

- **`.github/workflows/sitemap.yml` regenerates `sitemap.xml`** from all tracked `*.html` on every
  push that touches HTML, then **auto-commits `Update sitemap [skip ci]` to `main`**. So after you
  push HTML changes, `origin/main` moves ahead of you — **`git pull --rebase origin main` before your
  next push** (the bot's commit only touches `sitemap.xml`, so it never conflicts). **Don't hand-edit
  `sitemap.xml`**; add a page and it appears automatically (404 and `compare/` are excluded).
- Commits in this repo are authored solely by the owner — **do not add `Co-Authored-By` trailers.**
