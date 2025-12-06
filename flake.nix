{
  description = "Dev environment (flake-parts)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    "flake-parts".url = "github:hercules-ci/flake-parts";
  };

  outputs = inputs@{nixpkgs, flake-parts, ...}: 
    flake-parts.lib.mkFlake { inherit inputs; } (top@{ config, withSystem, moduleWithSystem, ... }: {
    systems = [
      "aarch64-darwin"
    ];

    perSystem = {pkgs, system, ...}: {
      packages.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_22
            pnpm
          ];
        };
    };
  });
}