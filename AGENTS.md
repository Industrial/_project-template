# Project Conventions

Repo-level conventions for agents working in this codebase. The harness pointer surface
lives in `.maestro/AGENTS.md`; this file holds code conventions, build commands, and
feature boundaries.

## Build / test / verify

From outside the dev shell, prefix any command with `bin/with-devenv` (it runs
the command with the shell's toolchain and env, without entering the shell).

```bash
blaze check              # inner loop: the daemon's verdict in seconds
blaze test               # inner loop: unit, integration, doctests
moon run :lint           # cargo fmt --check && cargo clippy --all-targets -D warnings
moon run :test           # cargo nextest run && cargo test --doc
moon run :build :docs :deny
moon run :format         # treefmt (Rust, Nix, shell, JS/TS, YAML, TOML, Actions)
```

The pre-push hook runs `:ci-format :lint :build :test :docs :deny`, and CI
(`.github/workflows/ci.yml`) runs the same targets. If they pass locally they
pass in CI; do not skip the hook to save time.

### blaze is the inner loop, cargo is the gate

[blaze](https://ix.dev/blaze), pinned by `local.features.program-blaze`, keeps
the workspace compiled in a per-user daemon. Use it for `build`, `check`,
`run` and `test` while iterating. Every gate runs cargo instead:

- **blaze is not a cargo wrapper.** It ships its own toolchain and never runs
  rustc, cargo, clippy or rustfmt. It has no `clippy`, `fmt`, `doc` (panics as
  of 0.20261030.1), `nextest`, `llvm-cov`, `deny`, `add` or `update`; an
  unknown subcommand exits 101 rather than falling back.
- **rustc is the final word.** blaze's verdict is its own front end's.
- **It is memory-hungry as a gate**: a worker per (crate, flag-set). See the
  top of `moon.yml` for the measurements.

`blaze test` reports a cached pass for unchanged inputs; `BLAZE_TESTS=all blaze
test` forces every test to run. `blaze status` / `blaze stop` / `blaze-doctor`
inspect the daemon. Do not add `[workspace.metadata.blaze] version` to
`Cargo.toml` — blaze would download and run that release instead of the
Nix-pinned one.

### Pins

- Rust: `rust-toolchain.toml` only. `devenv.nix` reads its `channel`; CI's
  `rustup toolchain install` reads the file. Bump `rust-version` in
  `Cargo.toml` with it. A version newer than devenv.lock's rust-overlay knows
  needs `bin/with-devenv devenv update rust-overlay`.
- moon: the dev shell's version, and `MOON_VERSION`/`MOON_SHA256` in `ci.yml`
  — keep them equal.
- Actions: by commit SHA with a `# vX.Y.Z` comment (Dependabot bumps both).

## Layout

- `crates/<name>/` — workspace members (glob); each has `[lints] workspace = true`
  and inherits `version`/`edition`/`rust-version`/`license` from the root.
- `crates/<name>/tests/` — integration tests; unit tests sit beside the code.
- `.maestro/` — harness state (read `.maestro/AGENTS.md` first)

## Conventions

- Dependency versions live in root `[workspace.dependencies]`; crates use `foo.workspace = true`.
- Fix lints rather than `#[allow]` them; an allow carries a comment saying why.
- Match existing code style; use established libraries before adding new ones.
- Surgical edits only — touch what the task requires.
- Bump the relevant version when behavior changes.

## See also

- `.maestro/MAESTRO.md` — read order, lane policy, daily commands
- `.maestro/docs/HARNESS.md` — product-delta vs harness-delta model
- `.maestro/docs/FEATURE_INTAKE.md` — work-type classification decision tree
- `.maestro/docs/VALIDATION_LADDER.md` — 7-step verification protocol

<!-- maestro-setup:start -->
## Maestro

This project is wired into the Maestro harness. State and config live
under `.maestro/`. Run `./init.sh` to bring a fresh checkout up; run
`maestro doctor` and `maestro status` to see what Maestro knows.

Preserve content outside this managed block; the block is rewritten by
`maestro setup` and the `maestro-setup` skill, but everything else in
this file is yours.
<!-- maestro-setup:end -->
