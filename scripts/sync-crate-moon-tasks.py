#!/usr/bin/env python3
"""Sync standard Moon tasks onto every crates/*/moon.yml."""

from __future__ import annotations

import re
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CRATES = ROOT / "crates"
ROOT_PROJECT = "test-loco-webapp"
REQUIRED = [
    "check",
    "clippy",
    "test",
    "coverage",
    "build",
    "audit",
    "docs",
    "bench",
    "check-docs",
]

# crates/web hosts the Loco binary (Cargo package test-loco-webapp).
APPLICATION_DIRS = {"web"}


def layer_of(text: str, crate_dir: str) -> str:
    match = re.search(r"^layer:\s*['\"]([^'\"]+)['\"]", text, re.M)
    if match:
        return match.group(1)
    return "application" if crate_dir in APPLICATION_DIRS else "library"


def render(pkg: str, layer: str, *, coverage_extra: list[str] | None = None) -> str:
    coverage_extra_yaml = "".join(f"\n      - {arg}" for arg in (coverage_extra or []))
    return f"""# https://moonrepo.dev/docs/config/project
language: 'rust'
layer: '{layer}'
tasks:
  check:
    description: 'cargo check -p {pkg}'
    deps: ['{ROOT_PROJECT}:format', '^:check']
    command:
      - cargo
      - check
      - -p
      - {pkg}
      - --all-targets
      - --all-features
    inputs:
      - 'Cargo.toml'
      - 'src/**/*.rs'
      - 'tests/**/*.rs'
    options:
      cache: true
      outputStyle: buffer-only-failure
  clippy:
    description: 'cargo clippy -D warnings -p {pkg}'
    deps: ['{ROOT_PROJECT}:format', '^:clippy', '~:check']
    command:
      - cargo
      - clippy
      - -p
      - {pkg}
      - --all-targets
      - --all-features
      - --
      - -D
      - warnings
    inputs:
      - 'Cargo.toml'
      - 'src/**/*.rs'
      - 'tests/**/*.rs'
    options:
      cache: true
      outputStyle: buffer-only-failure
  lint:
    description: 'Lint gate (clippy)'
    deps: ['{ROOT_PROJECT}:format', '^:lint', '~:clippy']
    command: bash
    args: ['-c', ':']
    inputs:
      - 'Cargo.toml'
      - 'src/**/*.rs'
      - 'tests/**/*.rs'
      - 'examples/**/*.rs'
    options:
      cache: true
      outputStyle: buffer-only-failure
  test:
    description: 'cargo nextest -p {pkg}'
    deps: ['{ROOT_PROJECT}:format', '^:test', '~:lint']
    command:
      - cargo
      - nextest
      - run
      - -p
      - {pkg}
    inputs:
      - 'Cargo.toml'
      - 'src/**/*.rs'
      - 'tests/**/*.rs'
    options:
      cache: true
      outputStyle: buffer-only-failure
  coverage:
    description: 'cargo llvm-cov nextest -p {pkg} (95% lines/regions/functions)'
    deps: ['{ROOT_PROJECT}:format', '~:test']
    command:
      - cargo
      - llvm-cov
      - nextest
      - -p
      - {pkg}{coverage_extra_yaml}
      - --fail-under-lines
      - '95'
      - --fail-under-regions
      - '95'
      - --fail-under-functions
      - '95'
    inputs:
      - 'Cargo.toml'
      - 'src/**/*.rs'
      - 'tests/**/*.rs'
    # Unique target dir avoids parallel crate coverages clobbering nextest binaries
    # (double-spawn "No such file" under shared target/llvm-cov-target).
    env:
      CARGO_TARGET_DIR: 'target/llvm-cov-{pkg}'
      CARGO_INCREMENTAL: '0'
    options:
      runFromWorkspaceRoot: true
      cache: true
      outputStyle: buffer-only-failure
  build:
    description: 'cargo build -p {pkg}'
    deps: ['{ROOT_PROJECT}:format', '^:build', '~:test']
    command:
      - cargo
      - build
      - -p
      - {pkg}
      - --all-targets
      - --all-features
    inputs:
      - 'Cargo.toml'
      - 'src/**/*.rs'
      - 'tests/**/*.rs'
      - 'examples/**/*.rs'
    options:
      cache: true
      outputStyle: buffer-only-failure
  audit:
    description: 'Run cargo audit for known Rust security advisories'
    command: 'cargo'
    args:
      - audit
      - -f
      - Cargo.lock
      # Transitive advisories; also listed in .cargo/audit.toml
      - --ignore
      - RUSTSEC-2026-0194
      - --ignore
      - RUSTSEC-2026-0195
      - --ignore
      - RUSTSEC-2026-0235
      - --ignore
      - RUSTSEC-2023-0071
    inputs:
      - '/Cargo.lock'
      - 'Cargo.toml'
      - '/.cargo/audit.toml'
    options:
      runFromWorkspaceRoot: true
      cache: true
      outputStyle: buffer-only-failure
  docs:
    description: 'cargo doc -p {pkg} --no-deps'
    deps: ['~:check']
    command:
      - cargo
      - doc
      - -p
      - {pkg}
      - --no-deps
      - --all-features
    inputs:
      - 'Cargo.toml'
      - 'src/**/*.rs'
    options:
      cache: true
      outputStyle: buffer-only-failure
  bench:
    description: 'Run benchmarks for {pkg} (no-op if no benches)'
    command: 'bash'
    args:
      - '-c'
      - 'if [ -d benches ]; then cargo bench -p {pkg}; else echo "No benches/ directory"; fi'
    inputs:
      - 'Cargo.toml'
      - 'src/**/*.rs'
      - 'benches/**/*'
    options:
      cache: false
      outputStyle: buffer-only-failure
  check-docs:
    description: 'Build docs for {pkg} (public API docs via rustc lints)'
    command: 'bash'
    args:
      - '-c'
      - 'mkdir -p ../../log && RUSTDOCFLAGS="" cargo doc -p {pkg} --all-features --no-deps 2>&1 | tee ../../log/docs-warnings-{pkg}.log | grep -E "(warning|error|Documenting|Finished)"'
    inputs:
      - 'Cargo.toml'
      - 'src/**/*.rs'
    options:
      outputStyle: buffer-only-failure
  examples:
    description: 'Run all crate example binaries (examples/*.rs); no-op if none'
    deps: ['{ROOT_PROJECT}:format', '~:test']
    command: 'bash'
    args:
      - '../../scripts/moon-run-crate-examples.sh'
      - '{pkg}'
    inputs:
      - 'Cargo.toml'
      - 'src/**/*.rs'
      - 'examples/**/*.rs'
    options:
      cache: true
      outputStyle: buffer-only-failure
"""


def main() -> None:
    updated: list[str] = []
    for cargo in sorted(CRATES.glob("*/Cargo.toml")):
        moon = cargo.parent / "moon.yml"
        pkg = tomllib.loads(cargo.read_text())["package"]["name"]
        crate_dir = cargo.parent.name
        old = moon.read_text() if moon.exists() else ""
        layer = layer_of(old, crate_dir)
        coverage_extra = ["--no-default-features"] if crate_dir == "web" else None
        new = render(pkg, layer, coverage_extra=coverage_extra)
        if old != new:
            moon.write_text(new)
            updated.append(f"{crate_dir} ({pkg}) layer={layer}")

    print(f"updated {len(updated)} crates:")
    for item in updated:
        print(" -", item)

    print("\nverification:")
    for moon in sorted(CRATES.glob("*/moon.yml")):
        tasks = re.findall(r"^  ([a-zA-Z0-9_-]+):", moon.read_text(), re.M)
        missing = [task for task in REQUIRED if task not in tasks]
        status = "OK" if not missing else f"MISSING {missing}"
        print(f" {moon.parent.name}: {status} tasks={tasks}")


if __name__ == "__main__":
    main()
