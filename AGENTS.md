# Project Conventions

Repo-level conventions for agents working in this codebase. The harness pointer surface
lives in `.maestro/AGENTS.md`; this file holds code conventions, build commands, and
feature boundaries.

## Build / test / verify

Run these through Moon, from inside the devenv shell:

```bash
moon run :check          # blaze check  — the fast inner-loop verdict
moon run :build          # blaze build
moon run :test           # blaze test   (unit, integration, doctests)
moon run :lint           # cargo fmt --check && cargo clippy -D warnings
moon run :format         # treefmt (Rust, Nix, shell, JS/TS, YAML, TOML)
moon run :cargo-check    # cargo check  — rustc's verdict, runs in the push gate
moon run :cargo-test     # cargo nextest run — likewise
moon run :audit :coverage :docs :check-docs
```

### Rust goes through blaze

[blaze](https://ix.dev/blaze) is the default Rust build command here, pinned by
`cursor.features.program-blaze` in `devenv.nix`. It keeps the workspace
compiled in a per-user daemon and rebuilds only what changed, so `build`,
`check`, `run` and `test` are roughly an order of magnitude faster than cargo on
an incremental edit. Use `blaze` wherever you would have typed `cargo`, for
those four commands.

Two things to know before reaching for it:

- **blaze is not a cargo wrapper.** It ships its own toolchain and never runs
  rustc, cargo, clippy or rustfmt. It has no `clippy`, `fmt`, `audit`,
  `nextest`, `llvm-cov`, `add` or `update` subcommand — an unknown subcommand
  exits 101 rather than falling back. `blaze doc` panics as of 0.20261030.1.
  Everything in that list stays cargo's, which is why the toolchain is still
  installed.
- **rustc is still the final word.** blaze's verdict is its own front end's and
  not yet all of rustc's, so the pre-push gate runs `:cargo-check` and
  `:cargo-test` as well. Do not drop them to make a push faster.

`blaze test` reports a cached pass for a test whose inputs have not changed
(`Cached N tests from an earlier run`); `BLAZE_TESTS=all blaze test` forces every
test to run.

`blaze status` shows the daemon and what it holds; `blaze stop` ends it;
`blaze-doctor` prints version, daemon and cache paths. Do not add
`[workspace.metadata.blaze] version` to `Cargo.toml` — blaze would download that
release itself and run it instead of the Nix-pinned one.

## Layout

- `src/` — application source
- `tests/` — automated tests
- `.maestro/` — harness state (read `.maestro/AGENTS.md` first)

## Conventions

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
