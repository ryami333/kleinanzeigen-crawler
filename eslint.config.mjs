// @ts-check

import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import typescriptEslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig([
  globalIgnores(["dist/", ".output/", ".next/"]),
  js.configs.recommended,
  ...typescriptEslint.configs.recommended,
  reactHooks.configs.flat.recommended,
]);
