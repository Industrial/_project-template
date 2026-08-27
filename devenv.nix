{
  inputs,
  pkgs,
  ...
}: let
  pkgs-playwright = import inputs.nixpkgs-playwright {system = pkgs.stdenv.hostPlatform.system;};
  browsers = (builtins.fromJSON (builtins.readFile "${pkgs-playwright.playwright-driver}/browsers.json")).browsers;
  chromium-rev = (builtins.head (builtins.filter (x: x.name == "chromium") browsers)).revision;

  # Moon from GitHub releases (x86_64-linux). See https://moonrepo.dev/docs/install
  moon = pkgs.stdenv.mkDerivation {
    pname = "moon-cli";
    version = "2.3.3";
    src = pkgs.fetchurl {
      url = "https://github.com/moonrepo/moon/releases/download/v2.3.3/moon_cli-x86_64-unknown-linux-gnu.tar.xz";
      sha256 = "19y47x4dh2dkvzx0nfzjcw97qvwiidkh0dimza6da4ivjdywfa66";
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

  # roam-code: architectural intelligence CLI + MCP (`roam mcp` needs `fastmcp`)
  # https://github.com/Cranot/roam-code — pin to a tagged release with MCP support.
  roam-code-src = pkgs.fetchFromGitHub {
    owner = "Cranot";
    repo = "roam-code";
    rev = "9023ed76922d61ae4514d15e9d81b86ddfaf1569"; # v11.2.0
    hash = "sha256-hE1gihZlJUQ8e8dOOpsxQM3b2KgvPAsU4wsJclmkptc=";
  };
  roam-code = pkgs.python3Packages.buildPythonApplication rec {
    pname = "roam-code";
    version = "11.2.0";
    src = roam-code-src;
    format = "pyproject";
    nativeBuildInputs = with pkgs.python3Packages; [setuptools wheel];
    propagatedBuildInputs = with pkgs.python3Packages; [
      click
      tree-sitter
      tree-sitter-language-pack
      networkx
      fastmcp
    ];
    doCheck = false;
  };

  # lean-ctx: MCP context runtime + shell compression (https://github.com/yvgude/lean-ctx)
  lean-ctx = pkgs.rustPlatform.buildRustPackage rec {
    pname = "lean-ctx";
    version = "3.1.5";
    src = pkgs.fetchCrate {
      inherit pname version;
      hash = "sha256-WrLKCd6YzN5fxmBlyv9XSvAKXEtMbhuskyeDeLNFG2w=";
    };
    cargoHash = "sha256-n/xrYp8OLkmjbm3hjS9Mzx18VHs8Oh4Op767NM6rmI0=";
    doCheck = false;
  };
in {
  name = "test-loco-webapp";

  dotenv = {
    enable = true;
  };

  # cachix = {
  #   pull = ["project-template"];
  #   push = "project-template";
  # };

  # Languages
  languages = {
    javascript = {
      enable = true;
      # Pin Node 22 — Playwright 1.52 hangs under nodejs-slim-24 from the default toolchain.
      package = pkgs.nodejs_22;
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

    # uv venv at `.devenv/state/venv` — Serena MCP (`scripts/serena-mcp-wrapper.sh`); see pyproject.toml [dependency-groups].
    python = {
      enable = true;
      uv = {
        enable = true;
        sync = {
          enable = true;
          arguments = [
            "--no-install-project"
            "--group"
            "serena"
          ];
        };
      };
    };
  };

  env = {
    RUST_BACKTRACE = "1";
    CARGO_TERM_COLOR = "always";
    RUSTC_WRAPPER = "sccache";
    # Serial moon avoids cargo target lock contention under hook execution.
    MOON_CONCURRENCY = "1";
    MOON_TOOLCHAIN_FORCE_GLOBALS = "1";
    # Match `cargo test` exit status when a crate has no tests (nextest defaults to failing with code 4).
    NEXTEST_NO_TESTS = "pass";
    LD_LIBRARY_PATH = builtins.concatStringsSep ":" [
      "${pkgs.stdenv.cc.cc.lib}/lib"
      "${pkgs.glib.out}/lib"
      "${pkgs.nss.out}/lib"
      "${pkgs.nspr.out}/lib"
      "${pkgs.dbus.lib}/lib"
      "${pkgs.atk.out}/lib"
      "${pkgs.at-spi2-atk.out}/lib"
      "${pkgs.expat.out}/lib"
      "${pkgs.at-spi2-core.out}/lib"
      "${pkgs.xorg.libX11.out}/lib"
      "${pkgs.xorg.libXcomposite.out}/lib"
      "${pkgs.xorg.libXdamage.out}/lib"
      "${pkgs.xorg.libXext.out}/lib"
      "${pkgs.xorg.libXfixes.out}/lib"
      "${pkgs.xorg.libXrandr.out}/lib"
      "${pkgs.mesa.out}/lib"
      "${pkgs.xorg.libxcb.out}/lib"
      "${pkgs.libxkbcommon.out}/lib"
      "${pkgs.systemd}/lib"
      "${pkgs.alsa-lib.out}/lib"
    ];
    PLAYWRIGHT_BROWSERS_PATH = "${pkgs-playwright.playwright.browsers}";
    PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = true;
    PLAYWRIGHT_NODEJS_PATH = "${pkgs.nodejs_22}/bin/node";
    PLAYWRIGHT_LAUNCH_OPTIONS_EXECUTABLE_PATH = "${pkgs-playwright.playwright.browsers}/chromium-${chromium-rev}/chrome-linux/chrome";
    PLAYWRIGHT_CHROMIUM_USE_HEADLESS_SHELL = "0";
  };

  # Development packages
  packages = with pkgs; [
    inputs.nixpkgs-unstable.legacyPackages.${pkgs.stdenv.hostPlatform.system}.beads
    inputs.definitively.packages.${pkgs.stdenv.hostPlatform.system}.definitively
    cachix

    clippy
    rust-analyzer
    rustc

    direnv

    alejandra

    cargo-watch
    cargo-audit
    cargo-llvm-cov
    cargo-nextest

    sccache
    mold

    git
    gh
    uv
    commitizen
    prek

    roam-code
    lean-ctx

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

    # jq — JSON CLI for shell hooks and automation scripts
    jq
    sqlite
    nodejs_22
    # Native libs for uv-installed wheels (Serena / transitive deps) on NixOS
    zlib
    pkgs.stdenv.cc.cc.lib
  ];

  scripts = {
    intro = {
      exec = ''
        playwrightInstalledVersion=""
        for pkg in crates/web/e2e/package.json; do
          if [ -f "$pkg" ]; then
            version=$(grep -o '"@playwright/test":\s*"[^"]*"' "$pkg" 2>/dev/null | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | head -1)
            if [ -n "$version" ]; then
              playwrightInstalledVersion="$version"
              break
            fi
          fi
        done

        if [ -z "$playwrightInstalledVersion" ]; then
          playwrightInstalledVersion="not found"
        fi

        echo "❄️  Playwright nix version: ${pkgs-playwright.playwright.version}"
        echo "📦 Playwright bun version: $playwrightInstalledVersion"

        if [ "$playwrightInstalledVersion" != "not found" ] && [ "${pkgs-playwright.playwright.version}" != "$playwrightInstalledVersion" ]; then
          echo "⚠️  Playwright versions in nix (devenv.yaml) and bun (package.json) differ — align them."
        else
          echo "✅ Playwright versions in nix and bun are compatible"
        fi
      '';
    };

    moon-sync = {
      exec = ''
        moon sync
      '';
    };

    # Pre-commit / pre-push: shared wrappers so git hooks and `devenv shell -- pre-commit` stay aligned.
    pre-commit = {
      exec = ''
        exec "$DEVENV_ROOT/scripts/git-hook-pre-commit.sh"
      '';
    };

    pre-push = {
      exec = ''
        exec "$DEVENV_ROOT/scripts/git-hook-pre-push.sh"
      '';
    };
  };

  # Hook install: `devenv:git-hooks:install` then `scripts/install-git-hooks.sh` (-f overwrite; see enterShell).
  enterShell = ''
    mkdir -p "$DEVENV_ROOT/tmp"
    export TMPDIR="$DEVENV_ROOT/tmp"

    intro

    moon-sync

    # uv sync installs Serena into `.devenv/state/venv/bin`; devenv does not prepend by default.
    export PATH="''${DEVENV_ROOT}/.devenv/state/venv/bin:''${PATH}"

    mkdir -p "$HOME/.cache/sccache"
    chmod 755 "$HOME/.cache/sccache" 2>/dev/null || true

    # prek install without -f leaves migration-mode shims: hooks pass but commit/push abort.
    "$DEVENV_ROOT/scripts/install-git-hooks.sh"
  '';

  git-hooks = {
    package = pkgs.prek;

    # commit-msg only via prek. pre-commit / pre-push are installed directly by
    # scripts/install-git-hooks.sh so moon sees the full worktree (no prek stash).
    default_stages = [
      "commit-msg"
    ];

    hooks = {
      commitizen = {
        enable = true;
      };

      # Disabled here — see scripts/install-git-hooks.sh (direct moon wrappers).
      pre-commit = {
        enable = false;
      };

      pre-push = {
        enable = false;
      };
    };
  };
}
