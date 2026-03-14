# Project template

Rust workspace template with moon tasks, treefmt, cargo-deny, prek, and devenv.

## Setup

```bash
devenv shell
```

## Commands (moon)

Run tasks with `moon run :<task>` (or `devenv shell -- moon run :<task>`):

- `:format` — format code (treefmt)
- `:check` — cargo check
- `:lint` — fmt --check + clippy
- `:build` — cargo build
- `:test` — cargo nextest run
- `:docs` — cargo doc
- `:fix` — cargo fix + clippy --fix
- `:bench` — cargo bench (no-op if no benches/)
- `:audit` — cargo audit
- `:coverage` — llvm-cov + nextest
- `:check-docs` — doc + clippy missing_docs

Pre-push (prek hook; runs `:format :check :lint :build :test :audit :check-docs` via `devenv shell -- pre-push`):

- Installed by `prek-install` on `devenv shell`; runs automatically on `git push`.

CI:

- `:ci-format` — treefmt with fail-on-change (use in GitHub Actions: `moon run :ci-format`)
