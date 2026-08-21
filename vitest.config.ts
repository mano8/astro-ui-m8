import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const fixture = (path: string) =>
  fileURLToPath(new URL(`./fixtures/registry-consumer/${path}`, import.meta.url));

export default defineConfig({
  // Registry blocks are written to be copied into a consumer app, so they
  // import `@/lib/utils` and optional peers this package never installs. The
  // render tests under `tests/registry/**` therefore resolve those specifiers
  // to the very shims `npm run verify:registry-consumer` compiles the copied
  // blocks against, so both gates agree on the same consumer surface.
  resolve: {
    alias: {
      "@/lib/utils": fixture("lib/utils.ts"),
      "lucide-react": fixture("types/lucide-react.tsx")
    }
  },
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
