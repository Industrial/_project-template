let
  assay = import ../lib/assay.nix;
  h = import ../lib/feature-eval.nix {};
  off = h.feature ./git-hooks-moon.nix {};
  on = h.feature ./git-hooks-moon.nix {local.features.git-hooks-moon.enable = true;};
  custom = h.feature ./git-hooks-moon.nix {
    local.features.git-hooks-moon = {
      enable = true;
      preCommitTargets = ":test";
      prePushTargets = ":coverage";
    };
  };
  has = name: builtins.elem name on.scripts;
in
  assay.suite "git-hooks-moon" {
    disabledEnv = assay.eq off.env {};
    disabledScripts = assay.eq off.scripts [];
    envKeys = assay.hasAttrs on.env [
      "CARGO_TERM_COLOR"
      "MOON_CONCURRENCY"
      "MOON_TOOLCHAIN_FORCE_GLOBALS"
      "NEXTEST_NO_TESTS"
      "OPENSSL_NO_VENDOR"
      "RUST_LOG"
    ];
    cargoColor = assay.eq on.env.CARGO_TERM_COLOR "always";
    concurrency = assay.eq on.env.MOON_CONCURRENCY "1";
    toolchain = assay.eq on.env.MOON_TOOLCHAIN_FORCE_GLOBALS "rust";
    nextest = assay.eq on.env.NEXTEST_NO_TESTS "pass";
    openssl = assay.eq on.env.OPENSSL_NO_VENDOR "1";
    rustLog = assay.eq on.env.RUST_LOG "info";
    preCommitScript = assay.eq (has "pre-commit") true;
    prePushScript = assay.eq (has "pre-push") true;
    preCommitDefault = assay.eq (builtins.match ".*andromeda:coverage.*" on.scriptExec.pre-commit != null) true;
    prePushDefault = assay.eq (builtins.match ".*afml:coverage.*" on.scriptExec.pre-push != null) true;
    customPreCommit = assay.eq (builtins.match ".*:test.*" custom.scriptExec.pre-commit != null) true;
    customPrePush = assay.eq (builtins.match ".*:coverage.*" custom.scriptExec.pre-push != null) true;
  }
