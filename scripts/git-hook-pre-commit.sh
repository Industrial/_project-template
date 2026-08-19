#!/usr/bin/env bash
# pre-commit quality gates (moon). Invoked by prek / devenv `pre-commit` script.
set -euo pipefail

root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$root"

# Git sets GIT_INDEX_FILE for hooks; moon/git children must not inherit it
# (relative .git/index breaks when cwd changes under TMPDIR=tmp/).
unset GIT_INDEX_FILE GIT_PREFIX || true

mkdir -p "$root/tmp"
export TMPDIR="$root/tmp"
export MOON_CONCURRENCY="${MOON_CONCURRENCY:-1}"
export MOON_TOOLCHAIN_FORCE_GLOBALS="${MOON_TOOLCHAIN_FORCE_GLOBALS:-1}"
export NEXTEST_NO_TESTS="${NEXTEST_NO_TESTS:-pass}"

run_moon() {
    moon run :ci-format :check :clippy :test :build
}

if command -v moon >/dev/null 2>&1; then
    run_moon
elif command -v devenv >/dev/null 2>&1; then
    devenv shell -- bash -lc 'moon run :ci-format :check :clippy :test :build'
else
    echo "git-hook-pre-commit: neither moon nor devenv found on PATH" >&2
    exit 127
fi
