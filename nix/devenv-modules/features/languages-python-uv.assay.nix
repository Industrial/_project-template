let
  assay = import ../lib/assay.nix;
  h = import ../lib/feature-eval.nix {};
  off = h.feature ./languages-python-uv.nix {};
  on = h.feature ./languages-python-uv.nix {local.features.languages-python-uv.enable = true;};
  custom = h.feature ./languages-python-uv.nix {
    local.features.languages-python-uv = {
      enable = true;
      version = "3.11";
      syncArguments = ["--no-install-project" "--group" "dev"];
    };
  };
in
  assay.suite "languages-python-uv" {
    disabled = assay.eq off.languages.python.enable false;
    enabled = assay.eq on.languages.python.enable true;
    defaultVersion = assay.eq on.languages.python.version "3.12";
    uvEnable = assay.eq on.languages.python.uvEnable true;
    uvSyncEnable = assay.eq on.languages.python.uvSyncEnable true;
    defaultSyncArgs = assay.eq on.languages.python.uvSyncArguments [];
    customVersion = assay.eq custom.languages.python.version "3.11";
    customSyncArgs = assay.eq custom.languages.python.uvSyncArguments ["--no-install-project" "--group" "dev"];
    enterShellPath = assay.eq (builtins.match ".*venv/bin.*" on.enterShell != null) true;
  }
