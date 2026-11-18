let
  assay = import ../lib/assay.nix;
  h = import ../lib/feature-eval.nix {};
  off = h.feature ./env-python-ld.nix {};
  on = h.feature ./env-python-ld.nix {local.features.env-python-ld.enable = true;};
in
  assay.suite "env-python-ld" {
    disabledEnv = assay.eq off.env {};
    enabledHasLd = assay.hasAttrs on.env ["LD_LIBRARY_PATH"];
    pathNonEmpty = assay.eq (builtins.stringLength on.env.LD_LIBRARY_PATH > 0) true;
  }
