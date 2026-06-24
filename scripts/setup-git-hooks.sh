#!/usr/bin/env bash
# One-time setup: point this clone at the tracked hooks in .githooks/
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
chmod +x "$ROOT/.githooks/prepare-commit-msg" "$ROOT/.githooks/commit-msg" "$ROOT/scripts/commit.sh"
git config core.hooksPath .githooks
echo "Git hooks active (.githooks/). Use ./scripts/commit.sh or git commit as usual."
