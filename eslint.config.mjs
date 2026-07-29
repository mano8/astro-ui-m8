import js from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";
import security from "eslint-plugin-security";

export default [
  {
    ignores: [
      "dist/",
      "coverage/",
      ".astro/",
      "pagefind/",
      ".tmp/",
      "fixtures/",
      "registry/r/",
      ".npm/",
      ".npm-cache/",
    ],
  },
  {
    ...js.configs.recommended,
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      security,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...security.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "security/detect-object-injection": "off",
      "security/detect-non-literal-fs-filename": "off",
    },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      "@eslint-react": eslintReact,
    },
    rules: {
      ...eslintReact.configs["recommended-typescript"].rules,
    },
  },
  {
    files: ["tests/**", "**/*.test.{ts,tsx}"],
    rules: {
      "security/detect-non-literal-regexp": "off",
      "security/detect-unsafe-regex": "off",
    },
  },
];
