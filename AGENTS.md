# Agent instructions

Cursor agents working in this repo should follow:

1. **`CLAUDE.md`** — project architecture, commands, content system, theming, deploy gotchas.
2. **`.cursor/rules/`** — workflow memory ported from Claude Code:
   - `github-workflow.mdc` — push auth, main-branch workflow, commit authorship
   - `design-explorations.mdc` — overlay CSS theme workflow
   - `user-context.mdc` — GitHub username, clone path, commit/push gates

Source of truth for page text: `assets/js/content.js` and `assets/js/progress.js`, not HTML skeletons.

## Cursor Cloud specific instructions

- This is a **static site — nothing to install, build, compile, lint, or test.** There is no `package.json`, bundler, or test runner. The only requirement is `python3` (already present on the VM), so the startup update script is a no-op check.
- **Run it** with the dev server documented in `CLAUDE.md` / `README.md`: `python3 -m http.server 8000`, then open `http://localhost:8000`. It MUST be served over HTTP — opening an `.html` file via `file://` shows a blank page because pages load `/assets/...` via absolute paths and render all text at runtime through `assets/js/app.js`.
- **Verify visual/content changes in a browser**, not by reading HTML: the `.html` files are near-empty skeletons; a correct page still renders content because `app.js` injects it from `content.js` / `progress.js`. A blank page usually means a JS syntax error (e.g. a missing comma) in those data files.
- Language switcher (EN/JA/MS) and the light/dark theme toggle are the main interactive features; both are driven by `app.js` and persisted to `localStorage`.
