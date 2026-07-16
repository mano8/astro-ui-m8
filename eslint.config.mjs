import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginSecurity from "eslint-plugin-security";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // Never lint build output, coverage, generated registry, or vendored deps.
  // `**/` prefixes catch nested build dirs (e.g. fixtures/*/dist, .astro).
  globalIgnores([
    "**/dist/**",
    "**/coverage/**",
    "**/.astro/**",
    "**/pagefind/**",
    ".tmp/**",
    "fixtures/**",
    "registry/r/**",
    ".npm/**",
    ".npm-cache/**",
  ]),

  // Base JS recommended rules for all source files.
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },

  // TypeScript recommended (syntactic; no type information required).
  tseslint.configs.recommended,

  // Generated fixture consumers are excluded above. In package source, a
  // leading underscore explicitly marks intentionally unused API arguments.
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // Security scanning (mirrors Codacy's ESLint security patterns).
  pluginSecurity.configs.recommended,

  // React rules, scoped to files that actually contain JSX.
  {
    files: ["**/*.{jsx,tsx}"],
    ...pluginReact.configs.flat.recommended,
    plugins: {
      ...pluginReact.configs.flat.recommended.plugins,
      "react-hooks": pluginReactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      // New JSX transform - no React import required in scope.
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },

  // Type-aware correctness rules, scoped to source owned by this package.
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/restrict-template-expressions": "error",
      "@typescript-eslint/no-base-to-string": "error",
    },
  },

  // Tests build regexes from strings and use literal test patterns; the
  // security regexp heuristics are noise there (and Codacy excludes tests).
  {
    files: ["tests/**", "**/*.test.{ts,tsx}"],
    rules: {
      "security/detect-non-literal-regexp": "off",
      "security/detect-unsafe-regex": "off",
    },
  },

  // Governed exceptions for typed dictionary lookup and trusted build scripts.
  {
    rules: {
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "security/detect-object-injection": "off",
      "security/detect-non-literal-fs-filename": "off",
    },
  },
]);
