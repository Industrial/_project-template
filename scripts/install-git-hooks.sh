#!/usr/bin/env bash
# Install git hooks so commits/pushes always run moon quality gates.
#
# Moon gates are installed as *direct* `.git/hooks/{pre-commit,pre-push}` scripts
# (full worktree). prek stashes unstaged files before hooks, which breaks Cargo/
# Moon workspace graphs on partial `git add`.
#
# commitizen stays on prek (commit-msg only).
set -euo pipefail

if [[ -n "${CI:-}" ]]; then
    exit 0
fi

if git config --get core.hooksPath >/dev/null 2>&1; then
    echo "install-git-hooks: core.hooksPath is set; skipping (hooks managed elsewhere)" >&2
    exit 0
fi

root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$root"

hooks_dir="$root/.git/hooks"
mkdir -p "$hooks_dir"

rm -f \
    "$hooks_dir/pre-commit.legacy" \
    "$hooks_dir/pre-commit.old" \
    "$hooks_dir/pre-commit-user" \
    "$hooks_dir/pre-push.old" \
    "$hooks_dir/pre-push.legacy" 2>/dev/null || true

# commit-msg (commitizen) via prek — do not install prek pre-commit/pre-push.
if command -v prek >/dev/null 2>&1 && [[ -f .pre-commit-config.yaml ]]; then
    prek install -f -c .pre-commit-config.yaml -t commit-msg
fi

write_hook() {
    local name="$1"
    local script="$2"
    cat >"$hooks_dir/$name" <<EOF
#!/bin/sh
# Installed by scripts/install-git-hooks.sh — moon quality gates (full worktree).
ROOT="\$(git rev-parse --show-toplevel)"
exec bash "\$ROOT/scripts/$script"
EOF
    chmod +x "$hooks_dir/$name"
}

write_hook pre-commit git-hook-pre-commit.sh
write_hook pre-push git-hook-pre-push.sh

echo "install-git-hooks: installed moon pre-commit + pre-push; prek commit-msg"
