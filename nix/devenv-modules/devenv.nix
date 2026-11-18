# Shared devenv modules, vendored from Industrial/cursor-setup by bin/drop-cursor-setup.
# Only the modules this repo references are here. Namespace: local.features.*
{
  imports = [
    ./features/dotenv.nix
    ./features/env-python-ld.nix
    ./features/git-hooks-moon.nix
    ./features/git-hooks-prek.nix
    ./features/languages-javascript.nix
    ./features/languages-python-uv.nix
    ./features/languages-rust.nix
    ./features/packages-base.nix
    ./features/packages-formatters.nix
    ./features/packages-rust-dev.nix
    ./features/program-assay.nix
    ./features/program-blaze.nix
    ./features/program-moon.nix
  ];
}
