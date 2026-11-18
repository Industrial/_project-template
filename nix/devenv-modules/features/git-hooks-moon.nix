{
  lib,
  config,
  ...
}: let
  cfg = config.local.features.git-hooks-moon;
  # Weaker than lib.mkDefault (1000) so devenv dotenv / .env wins on conflict.
  soft = lib.mkOverride 1500;
in {
  options.local.features.git-hooks-moon = {
    enable = lib.mkEnableOption "Moon git-hook scripts + Rust/Moon/nextest env defaults";
    preCommitTargets = lib.mkOption {
      type = lib.types.str;
      # Notebooks only — do not fan out to crates/* via workspace :test/:coverage.
      default = "andromeda:coverage afml:coverage";
      description = "Moon targets for the pre-commit script";
    };
    prePushTargets = lib.mkOption {
      type = lib.types.str;
      # Notebooks only — do not fan out to crates/* via workspace :build/:coverage/:audit.
      default = "andromeda:coverage afml:coverage";
      description = "Moon targets for the pre-push script";
    };
  };

  config = lib.mkIf cfg.enable {
    env = {
      CARGO_TERM_COLOR = soft "always";
      MOON_CONCURRENCY = soft "1";
      MOON_TOOLCHAIN_FORCE_GLOBALS = soft "rust";
      NEXTEST_NO_TESTS = soft "pass";
      OPENSSL_NO_VENDOR = soft "1";
      RUST_LOG = soft "info";
    };

    scripts = {
      pre-commit.exec = ''
        unset GIT_INDEX_FILE GIT_PREFIX || true
        moon run ${cfg.preCommitTargets}
      '';

      pre-push.exec = ''
        unset GIT_INDEX_FILE GIT_PREFIX || true
        moon run ${cfg.prePushTargets}
      '';
    };
  };
}
