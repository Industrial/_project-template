{
  inputs,
  pkgs,
  ...
}: {
  imports = [./nix/devenv-modules];

  name = "project-template";

  # Shared modules from `nix/devenv-modules` — defaults are off; enable what this repo needs.
  # blaze is the default Rust build/check/run/test command (moon.yml drives it).
  # It ships its own toolchain, so languages-rust and packages-rust-dev stay on:
  # rust-analyzer, clippy, rustfmt and the cargo-* helpers are still cargo's.
  local.features.program-blaze.enable = true;
  local.features.program-moon.enable = true;
  local.features.dotenv.enable = true;
  local.features.packages-base.enable = true;
  local.features.packages-rust-dev.enable = true;
  local.features.packages-formatters.enable = true;
  local.features.env-python-ld.enable = true;
  local.features.languages-javascript.enable = true;

  # Agent harness — the `.cursor` toolchain that `.claude` agents/skills and
  # `.mcp.json` expect on PATH (mirrors idclear/monorepo). Paperclip stays
  # monorepo-only: it needs its own Postgres and process supervision.
  local.features.program-assay.enable = true;

  local.features.languages-rust = {
    enable = true;
    channel = "stable";
  };

  # uv venv at `.devenv/state/venv` — Serena MCP (`scripts/serena-mcp-wrapper.sh`);
  # see pyproject.toml [dependency-groups].
  local.features.languages-python-uv = {
    enable = true;
    syncArguments = [
      "--no-install-project"
      "--group"
      "serena"
    ];
  };

  local.features.git-hooks-moon = {
    enable = true;
    # Preserve this repo's Moon gate composition (not the shared ci-* defaults).
    # :check / :build / :test are blaze's. blaze's verdict is its own front
    # end's and not yet all of rustc's, so the push gate adds :cargo-check and
    # :cargo-test — rustc is still the last word before anything leaves here.
    preCommitTargets = ":format :check :lint :test";
    prePushTargets = ":format :check :lint :build :test :cargo-check :cargo-test :audit :check-docs";
  };
  local.features.git-hooks-prek.enable = true;

  # Project-only env (shared soft defaults cover CARGO_TERM_COLOR / Moon / nextest).
  env = {
    RUST_BACKTRACE = "1";
    RUSTC_WRAPPER = "sccache";
  };

  # Project-only packages (beads removed upstream in favor of Maestro).
  packages = [
    inputs.definitively.packages.${pkgs.stdenv.hostPlatform.system}.definitively
  ];

  # Project-only shell wiring (shared features handle moon-sync, prek install).
  enterShell = ''
    # Hermes: project-local home + seed templates (never overwrite secrets).
    export HERMES_HOME="$PWD/.hermes"
    mkdir -p "$HERMES_HOME"
    for _f in config.yaml SOUL.md; do
      if [ ! -f "$HERMES_HOME/$_f" ] && [ -f "nix/devenv-modules/features/hermes-agent/templates/$_f" ]; then
        cp "nix/devenv-modules/features/hermes-agent/templates/$_f" "$HERMES_HOME/$_f"
      fi
    done
    if [ ! -f "$HERMES_HOME/.env" ] && [ -f nix/devenv-modules/features/hermes-agent/templates/.env.example ]; then
      cp nix/devenv-modules/features/hermes-agent/templates/.env.example "$HERMES_HOME/.env"
    fi
  '';
}
