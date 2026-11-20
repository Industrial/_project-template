# Project template

A Rust workspace to start new projects from: Nix (devenv) for the toolchain,
blaze for the inner loop, moon for the gates, and GitHub Actions running the
same gates in CI.

## Start a project from it

```bash
git clone git@github.com:Industrial/_project-template.git my-project
cd my-project
git remote set-url origin <new-repo-url>
```

Then rename the placeholders: `name` in `devenv.nix`, `id` in `moon.yml`, the
`app` crate under `crates/`, and the TMPDIR path in `devenv.nix`'s
`enterShell`. Pick the licence in `Cargo.toml` (`[workspace.package]`).

## Local setup

```bash
direnv allow          # or: devenv shell
```

The shell provides, all pinned:

| What | Where it is pinned |
|------|--------------------|
| rustc, cargo, clippy, rustfmt, rust-analyzer | `rust-toolchain.toml` (devenv.nix reads it) |
| blaze | `local.features.program-blaze` (`nix/devenv-modules`) |
| moon, treefmt and its formatters, cargo-nextest, cargo-llvm-cov, cargo-deny, sccache, mold, lldb | `devenv.lock` |

From outside the shell, `bin/with-devenv <cmd>` runs one command with the
shell's toolchain and environment, without entering it.

## Development loop (blaze)

[blaze](https://ix.dev/blaze) keeps the workspace compiled in a per-user
daemon and rebuilds only what changed, so it answers in seconds:

```bash
blaze check           # or: moon run :dev-check
blaze test            # or: moon run :dev-test   (BLAZE_TESTS=all re-runs cached tests)
blaze run --bin app
blaze status          # what the daemon holds;  blaze stop  ends it
```

blaze is for typing by hand. It is not a cargo wrapper — it ships its own
toolchain and has no clippy, fmt, doc, nextest, llvm-cov or deny — and its
verdict is its own front end's, so every gate below runs cargo. See the
comment at the top of `moon.yml` for the measurements behind that split.

## Gates (moon)

| Task | Runs | Pre-commit | Pre-push / CI |
|------|------|:---:|:---:|
| `:format` | treefmt (writes) | ✓ | |
| `:ci-format` | treefmt, fail on change | | ✓ |
| `:lint` | `cargo fmt --check` + `cargo clippy --all-targets -D warnings` | ✓ | ✓ |
| `:check` | `cargo check --all-targets` | | |
| `:build` | `cargo build --all-targets` | | ✓ |
| `:test` | `cargo nextest run` + doctests | | ✓ |
| `:docs` | `cargo doc`, rustdoc warnings denied | | ✓ |
| `:deny` | cargo-deny: advisories, licences, bans, sources | | ✓ |
| `:coverage` | llvm-cov over nextest, HTML report | | |
| `:fix`, `:bench` | `cargo fix` + `clippy --fix`; benchmarks | | |

`moon run :lint :test` runs several. The hooks are installed by prek on shell
entry; commit messages are checked as conventional commits.

## Rust conventions baked in

- **Edition 2024, resolver 3**, MSRV = the pinned toolchain (`rust-version`).
- **Workspace inheritance**: version, edition, licence and lints come from the
  root `Cargo.toml`; a new crate under `crates/` is picked up by the glob and
  needs only `[lints] workspace = true` and `*.workspace = true` fields.
  Dependency versions go in `[workspace.dependencies]`.
- **Lints**: `unsafe_code` forbidden; `missing_docs`, clippy `all` + `pedantic`,
  `unwrap_used`, `dbg_macro`, `todo` warn. Warnings fail the gates, not
  ordinary builds.
- **Profiles**: dependencies built at `opt-level = 1` without debug info in
  dev; release uses thin LTO and one codegen unit.
- **Tests**: nextest (`.config/nextest.toml`; the `ci` profile retries once,
  reports flakes, writes JUnit). Unit tests beside the code, integration tests
  in each crate's `tests/`.
- **Cargo.lock is committed.**

## CI

| Workflow | When | What |
|----------|------|------|
| `ci.yml` | push to main, PRs | `gates` (lint, build, test, docs, deny) and `format` (treefmt with formatters from devenv.lock's nixpkgs); `CI Pass` aggregates them |
| `audit.yml` | daily, and on dependency changes | `cargo deny check advisories` |
| `dependabot.yml` | weekly | grouped bumps for Actions (SHA-pinned) and cargo |

Every action is pinned by commit SHA; moon is downloaded at a pinned version
and sha256-checked. In the new repository, require the `CI Pass` check on
`main` in branch protection.

## Layout

```
crates/app/            placeholder crate: lib.rs, main.rs, tests/
rust-toolchain.toml    the Rust pin
Cargo.toml             workspace, shared metadata, lints, profiles
.config/nextest.toml   test runner profiles
deny.toml              dependency policy
moon.yml               tasks
treefmt.toml           formatters (treefmt.ci.toml: same, fail on change)
devenv.nix/.yaml/.lock dev shell; shared modules vendored in nix/devenv-modules
.github/               CI, audit, dependabot
.maestro/              Maestro harness scaffold
```
