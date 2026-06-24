#!/usr/bin/env bash
# Repo commit wrapper: activates .githooks so Co-Authored-By trailers are stripped.
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
exec git -c "core.hooksPath=$ROOT/.githooks" commit "$@"
