# Agent instructions

Cursor agents working in this repo should follow:

1. **`CLAUDE.md`** — project architecture, commands, content system, theming, deploy gotchas.
2. **`.cursor/rules/`** — workflow memory ported from Claude Code:
   - `github-workflow.mdc` — push auth, main-branch workflow, commit authorship
   - `design-explorations.mdc` — overlay CSS theme workflow
   - `user-context.mdc` — GitHub username, clone path, commit/push gates

Source of truth for page text: `assets/js/content.js` and `assets/js/progress.js`, not HTML skeletons.
