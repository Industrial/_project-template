#!/usr/bin/env bash
# Run every example binary for a workspace Cargo package (used by Moon `examples` tasks).
# Exits 0 when examples/ is missing or has no *.rs (crate has no runnable examples).
set -euo pipefail
PKG="${1:?usage: moon-run-crate-examples.sh <Cargo package name>}"
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

MANIFEST="$(MOON_CRATE_PACKAGE="$PKG" python3 -c '
import json, os, subprocess, sys
pkg = os.environ["MOON_CRATE_PACKAGE"]
root = subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip()
out = subprocess.check_output(
    ["cargo", "metadata", "--no-deps", "--format-version", "1"],
    cwd=root,
    text=True,
)
data = json.loads(out)
for p in data["packages"]:
    if p["name"] == pkg:
        print(p["manifest_path"])
        raise SystemExit(0)
print(f"moon-run-crate-examples: unknown package {pkg!r}", file=sys.stderr)
raise SystemExit(1)
')"

CRATE_DIR="$(dirname "$MANIFEST")"
shopt -s nullglob
files=("$CRATE_DIR"/examples/*.rs)
if [ ${#files[@]} -eq 0 ]; then
    echo "moon-run-crate-examples: no examples for ${PKG} (ok)"
    exit 0
fi
for f in "${files[@]}"; do
    cargo run -p "$PKG" --example "$(basename "$f" .rs)" -q
done
