{
  inputs,
  pkgs,
  ...
}: let
  # rust-toolchain.toml is the one Rust pin: rustup reads it in CI, and the
  # shell takes its `channel` here, so both compile with the same rustc.
  rustToolchain = (builtins.fromTOML (builtins.readFile ./rust-toolchain.toml)).toolchain;
in {
  imports = [./nix/devenv-modules];

  name = "project-template";

  # Shared modules from `nix/devenv-modules` — defaults are off; enable what this repo needs.
  local.features.dotenv.enable = true;
  local.features.packages-base.enable = true;
  local.features.packages-formatters.enable = true;
  local.features.languages-javascript.enable = true;
  local.features.program-moon.enable = true;
  local.features.program-assay.enable = true;

  # Rust: rustc/cargo/clippy/rustfmt/rust-analyzer at the rust-toolchain.toml
  # pin, plus nextest, llvm-cov, sccache, mold and lldb.
  local.features.languages-rust = {
    enable = true;
    channel = "stable";
    version = rustToolchain.channel;
  };
  local.features.packages-rust-dev.enable = true;

  # blaze — the by-hand inner loop (`blaze check`, `blaze test`, `blaze run`).
  # It ships its own toolchain and keeps the workspace compiled in a per-user
  # daemon; the gates below stay cargo's (see moon.yml for why).
  local.features.program-blaze.enable = true;

  local.features.git-hooks-moon = {
    enable = true;
    # Commit: formatted and lint-clean. Push: everything CI runs — ci.yml's
    # `gates` and `format` jobs run these same moon targets.
    preCommitTargets = ":format :lint";
    prePushTargets = ":ci-format :lint :build :test :docs :deny";
  };
  local.features.git-hooks-prek.enable = true;

  # Project-only env (shared soft defaults cover CARGO_TERM_COLOR / Moon / nextest).
  env = {
    RUST_BACKTRACE = "1";
    RUSTC_WRAPPER = "sccache";
  };

  packages = [
    pkgs.cargo-deny
    inputs.definitively.packages.${pkgs.stdenv.hostPlatform.system}.definitively
  ];

  # Project-only shell wiring (shared features handle moon-sync, prek install).
  enterShell = ''
    # Keep build temporaries off tmpfs, which is RAM. Unset, TMPDIR defaults to
    # /tmp — a 2.0 GB tmpfs on this box, found 90% full — and a Rust build
    # broad enough to write past it dies with `No space left on device
    # (os error 28)`, which reads like a code defect and is not one.
    #
    # Exported here rather than in `env` because devenv clears TMPDIR after
    # applying `env`. Kept OUTSIDE the repository because a path inside the
    # tree inherits the repo's rustfmt.toml and breaks any test that formats
    # generated code in a temporary directory.
    export TMPDIR="$HOME/.cache/_project-template/tmp"
    mkdir -p "$TMPDIR"
  '';
}
