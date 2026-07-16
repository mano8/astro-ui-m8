import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      include: ["src/**/*.ts"],
      // The React test harness under src/testing is exercised by its own
      // self-tests (Phase 1) but is not line-gated here; strict 100% applies to
      // the pure runtime helpers (list-params, token/type surface).
      exclude: ["src/**/*.tsx", "src/testing/**"],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100
      }
    }
  }
});
