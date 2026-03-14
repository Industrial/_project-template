{
  inputs,
  pkgs,
  ...
}: let
  # Moon from GitHub releases (x86_64-linux). See https://moonrepo.dev/docs/install
  moon = pkgs.stdenv.mkDerivation {
    pname = "moon-cli";
    version = "2.0.4";
    src = pkgs.fetchurl {
      url = "https://github.com/moonrepo/moon/releases/download/v2.0.4/moon_cli-x86_64-unknown-linux-gnu.tar.xz";
      sha256 = "0n7w3pmnwaxk0cy63ms97g609z696698a4qdrssnsa7cs8wgxxc8";
    };
    nativeBuildInputs = [pkgs.autoPatchelfHook];
    buildInputs = [pkgs.stdenv.cc.cc.lib];
    installPhase = ''
      runHook preInstall
      mkdir -p $out/bin
      install -m755 moon $out/bin/moon
      runHook postInstall
    '';
    meta = {
      description = "Moon CLI (moonrepo)";
      homepage = "https://moonrepo.dev";
      license = pkgs.lib.licenses.mit;
      platforms = pkgs.lib.platforms.linux;
    };
  };
in {
  name = "project-template";

  dotenv = {
    enable = true;
  };

  cachix = {
    pull = ["project-template"];
    push = "project-template";
  };

  # Languages
  languages = {
    javascript = {
      enable = true;
      bun = {
        enable = true;
      };
    };

    typescript = {
      enable = true;
    };

    rust = {
      enable = true;
      channel = "stable";
      components = [
        "cargo"
        "clippy"
        "rust-analyzer"
        "rustc"
        "rustfmt"
        "llvm-tools"
      ];
      targets = [];
    };
  };

  env = {
    RUST_BACKTRACE = "1";
    CARGO_TERM_COLOR = "always";
    RUSTC_WRAPPER = "sccache";
    MOON_TOOLCHAIN_FORCE_GLOBALS = "rust";
  };

  # Development packages
  packages = with pkgs; [
    inputs.rust-symphony.packages.${pkgs.system}.default
    inputs.nixpkgs-unstable.legacyPackages.${pkgs.system}.beads
    cachix

    clippy
    rust-analyzer
    rustc

    direnv
    prek

    alejandra

    cargo-watch
    cargo-audit
    cargo-llvm-cov
    cargo-nextest

    sccache
    mold

    git
    gh

    moon

    actionlint
    alejandra
    beautysh
    biome
    deadnix
    rustfmt
    taplo
    treefmt
    vulnix
    yamlfmt
  ];

  scripts = {
    prek-install = {
      exec = ''
        prek install -q --overwrite
      '';
    };

    moon-sync = {
      exec = ''
        moon sync
      '';
    };

    # Pre-push: run full check via moon (used by prek hook)
    pre-push = {
      exec = ''
        export MOON_TOOLCHAIN_FORCE_GLOBALS=rust
        moon run :format :check :lint :build :test :audit :check-docs
      '';
    };
  };

  enterShell = ''
    prek-install
    moon-sync

    mkdir -p "$HOME/.cache/sccache"
    chmod 755 "$HOME/.cache/sccache" 2>/dev/null || true
  '';
}
