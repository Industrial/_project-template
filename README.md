# Project template

Rust + Bun/TypeScript workspace template with Nix (devenv), moon tasks, treefmt, cargo-deny, prek git hooks, and optional Cachix.

---

## Overview

- **Runtimes:** Rust (stable), JavaScript/TypeScript (Bun).
- **Environment:** Nix via [devenv](https://devenv.sh); reproducible toolchain and scripts.
- **Tasks:** [moon](https://moonrepo.dev) for format, check, lint, build, test, docs, audit, coverage, etc.
- **Git hooks:** [prek](https://github.com/j178/prek) (pre-commit–compatible): pre-push runs the full moon pipeline; commit-msg enforces conventional commits (commitizen).
- **Formatting:** [treefmt](https://github.com/numtide/treefmt) over Rust, Nix, shell, JS/TS, YAML, TOML.
- **Rust quality:** cargo-deny (advisories/licenses), cargo-audit, clippy, nextest, optional llvm-cov.

---

## Tooling

| Tool | Purpose | Config |
|------|--------|--------|
| **devenv** | Nix dev shell: languages (Rust, Bun, TS), packages, env vars, scripts. Enter with `devenv shell`. | `devenv.nix`, `devenv.yaml` |
| **moon** | Task runner: format, check, lint, build, test, docs, fix, bench, audit, coverage, ci-format. | `moon.yml` |
| **prek** | Git hooks (no Python). Installs from `.pre-commit-config.yaml` on `devenv shell`. | `.pre-commit-config.yaml` |
| **treefmt** | Single CLI to format all supported files (only tracked files by default). | `treefmt.toml`, `treefmt.ci.toml` |
| **rustfmt** | Rust formatter (invoked by treefmt). | `rustfmt.toml` |
| **cargo-deny** | Rust: advisories, licenses, duplicate deps. Run manually or in CI. | `deny.toml` |
| **cargo-audit** | Rust security advisories. Used in moon `:audit` and pre-push. | — |
| **cargo-nextest** | Fast Rust test runner. Used in moon `:test` and `:coverage`. | `nextest.toml` |
| **sccache** | Shared compilation cache for Rust (and C/C++) across builds. | env `RUSTC_WRAPPER=sccache` |
| **mold** | Fast linker for Rust on Linux. | — |
| **commitizen** | Validates commit messages (conventional commits). Prek hook on commit-msg. | — |
| **Cachix** | Optional Nix binary cache; pull/push configured in `devenv.nix`. | `cachix.pull` / `cachix.push` |

### Treefmt formatters (by file type)

- **Nix:** deadnix, alejandra  
- **GitHub Actions:** actionlint  
- **Bash:** beautysh  
- **JS/TS/JSON:** biome  
- **YAML:** yamlfmt  
- **TOML:** taplo  
- **Rust:** rustfmt (edition 2024)

---

## Lifecycle: what happens when

### 1. Clone the repo

```bash
git clone --recurse-submodules <repo-url>
cd <repo>
```

- The `.cursor/agency-agents` directory is a **git submodule**; `--recurse-submodules` pulls it. Without it, run `git submodule update --init` later.

### 2. Enter the dev shell (first time and daily)

```bash
devenv shell
```

**On enter, devenv runs:**

1. **prek-install** — Installs git hooks from `.pre-commit-config.yaml` (pre-push, commit-msg) into `.git/hooks`. Overwrites existing hook files so the repo’s config is always in use.
2. **moon-sync** — Runs `moon sync` so moon’s toolchain and project graph are up to date.
3. **sccache** — Ensures `$HOME/.cache/sccache` exists so the Rust compiler cache can be used.

**You get:**

- Rust (stable), clippy, rustfmt, rust-analyzer, cargo-nextest, cargo-llvm-cov, cargo-audit  
- Bun + TypeScript  
- moon, treefmt, and all formatters (alejandra, beautysh, biome, taplo, yamlfmt, etc.)  
- prek, git, gh, direnv  
- Env: `RUST_BACKTRACE=1`, `CARGO_TERM_COLOR=always`, `RUSTC_WRAPPER=sccache`, `MOON_TOOLCHAIN_FORCE_GLOBALS=rust`  
- Scripts: `prek-install`, `moon-sync`, `pre-push` (used by the pre-push hook)

Optional: if you use [direnv](https://direnv.net), `direnv allow` in the repo will enter the devenv shell automatically when you `cd` in.

### 3. Develop

- **Format:** `moon run :format` (writes changes) or `moon run :ci-format` (CI-style; fails if anything would change).
- **Check / lint / build / test:**  
  `moon run :check`, `:lint`, `:build`, `:test`  
  Or run the full gate:  
  `devenv shell -- pre-push` (same as the pre-push hook).
- **Fix auto-fixable issues:** `moon run :fix`
- **Docs:** `moon run :docs` or `:check-docs`
- **Security:** `moon run :audit`; run `cargo deny check` manually for full deny checks.
- **Coverage:** `moon run :coverage` (nextest under llvm-cov).

All of these use the tools and configs from the dev shell (rustfmt, nextest.toml, etc.).

### 4. Commit

- When you run `git commit`, the **commit-msg** hook (prek + commitizen) runs.
- It validates that the commit message follows conventional commits (e.g. `feat: add X`, `fix: Y`). If not, the commit is rejected.

### 5. Push

- When you run `git push`, the **pre-push** hook runs.
- The hook runs: `devenv shell -- pre-push`
- **pre-push** (defined in `devenv.nix` scripts) runs:  
  `moon run :format :check :lint :build :test :audit :check-docs`
- If any of these fail, the push is aborted. So the branch you push has already been formatted, checked, linted, built, tested, audited, and doc-checked in the same way as in CI.

### 6. CI (when you add it)

- In GitHub Actions (or similar), use the same commands inside a Nix/devenv setup so CI matches local and pre-push.
- **Format check:** `devenv shell -- moon run :ci-format`  
  Uses `treefmt.ci.toml` (same as treefmt but `fail-on-change = true`).
- **Full pipeline:** `devenv shell -- moon run :format :check :lint :build :test :audit :check-docs`  
  Or use `devenv shell -- pre-push` to mirror the pre-push hook exactly.

---

## Moon tasks quick reference

| Task | What it does |
|------|----------------|
| `:format` | treefmt (format tracked files) |
| `:ci-format` | treefmt with `treefmt.ci.toml` (fail if not formatted) |
| `:check` | cargo check --workspace --all-features |
| `:lint` | cargo fmt --check + cargo clippy |
| `:build` | cargo build |
| `:test` | cargo nextest run |
| `:docs` | cargo doc --no-deps --all-features |
| `:fix` | cargo fix + clippy --fix |
| `:bench` | cargo bench (no-op if no `benches/`) |
| `:audit` | cargo audit |
| `:coverage` | cargo llvm-cov nextest |
| `:check-docs` | cargo doc + clippy with missing_docs lint |

Run with: `moon run :<task>` or `devenv shell -- moon run :<task>` from outside the shell.

---

## Config files

- **devenv.nix** — Dev shell: packages, env, scripts (prek-install, moon-sync, pre-push).
- **devenv.yaml** — Nix flake inputs (fenix, nixpkgs, rust-overlay, etc.).
- **moon.yml** — Moon project and task definitions.
- **treefmt.toml** — Formatters and globs (local format; `walk = "git"`).
- **treefmt.ci.toml** — Same as above with `fail-on-change = true` for CI.
- **rustfmt.toml** — Rust format options (edition 2024, 2 spaces).
- **deny.toml** — cargo-deny: advisories, licenses, bans.
- **nextest.toml** — nextest profiles (default + ci), timeouts, cache.
- **.pre-commit-config.yaml** — prek: pre-push (devenv pre-push script), commit-msg (commitizen).

---

## Summary flow

1. **Clone** (with submodules) → **devenv shell** → prek installs hooks, moon syncs, sccache ready.  
2. **Develop** with moon tasks (`:format`, `:check`, `:lint`, `:build`, `:test`, etc.).  
3. **Commit** → commitizen checks message.  
4. **Push** → pre-push runs full moon pipeline; push only if it passes.  
5. **CI** (when added) runs the same commands (e.g. `:ci-format` and the same full pipeline) inside devenv so results match local and pre-push.
