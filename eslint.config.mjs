import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  /*
   * `.next-verify` and `.next-e2e` are the alternate build directories used by
   * `npm run build:check` and the Playwright harness (see NEXT_DIST_DIR in
   * next.config.ts). Only `.next` was ignored, so lint was walking compiled
   * output — and failing with ENOENT when a concurrent build replaced a chunk
   * mid-read, which is why `npm run lint` never reached a verdict.
   */
  { ignores: [".next", ".next-*", "out", "e2e-report", "test-results", "next-env.d.ts"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  eslintPluginPrettier,
);
