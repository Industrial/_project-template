#!/usr/bin/env bash
# pre-push quality gates (moon). Invoked by prek / devenv `pre-push` script.
set -euo pipefail

root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$root"

unset GIT_INDEX_FILE GIT_PREFIX || true

mkdir -p "$root/tmp"
export TMPDIR="$root/tmp"
export MOON_CONCURRENCY="${MOON_CONCURRENCY:-1}"
export MOON_TOOLCHAIN_FORCE_GLOBALS="${MOON_TOOLCHAIN_FORCE_GLOBALS:-rust}"
export NEXTEST_NO_TESTS="${NEXTEST_NO_TESTS:-pass}"

run_moon() {
    moon run :ci-format :check :clippy :test :build :audit :docs :check-docs :bench :coverage
}

if command -v moon >/dev/null 2>&1; then
    run_moon
elif command -v devenv >/dev/null 2>&1; then
    devenv shell -- bash -lc 'moon run :ci-format :check :clippy :test :build :audit :docs :check-docs :bench :coverage'
else
    echo "git-hook-pre-push: neither moon nor devenv found on PATH" >&2
    exit 127
fi
