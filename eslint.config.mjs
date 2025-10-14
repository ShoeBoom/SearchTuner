// @ts-check
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";

import importPlugin from "eslint-plugin-import";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

export default defineConfig([
  eslint.configs.recommended,
  eslintPluginPrettierRecommended,
  tseslint.configs.strictTypeChecked,
  importPlugin.flatConfigs.recommended,
  {
    rules: {
      "prettier/prettier": "warn",
      "import/no-unresolved": "off",
      "no-restricted-imports": [
        "warn",
        {
          paths: [],
        },
      ],
      "@typescript-eslint/no-confusing-void-expression": [
        "warn",
        {
          ignoreArrowShorthand: true,
        },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],
      "@typescript-eslint/no-empty-object-type": "off",
    },
    linterOptions: { reportUnusedDisableDirectives: true },
    languageOptions: { parserOptions: { projectService: true } },
  },
  {
    ignores: [".output/*", "node_modules/*", ".wxt/*"],
  },
]);
