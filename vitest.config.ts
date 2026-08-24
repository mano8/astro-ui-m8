import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

import { registrySiblingAliases } from "./fixtures/registry-sibling-aliases.js";

const fixture = (path: string) =>
  fileURLToPath(new URL(`./fixtures/registry-consumer/${path}`, import.meta.url));

export default defineConfig({
  // Registry blocks are written to be copied into a consumer app, so they
  // import `@/lib/utils` and optional peers this package never installs. The
  // render tests under `tests/registry/**` therefore resolve those specifiers
  // to the very shims `npm run verify:registry-consumer` compiles the copied
  // blocks against, so both gates agree on the same consumer surface.
  resolve: {
    alias: [
      { find: "@/lib/utils", replacement: fixture("lib/utils.ts") },
      // `error-boundary` renders the canonical `state-error` block as its
      // default fallback, and that block imports two shadcn primitives. They
      // resolve to the same fixture shims the copied-skin gate compiles
      // against, so a render test exercises the real fallback rather than a
      // stub of it.
      { find: "@/components/ui/alert", replacement: fixture("components/ui/alert.tsx") },
      { find: "@/components/ui/button", replacement: fixture("components/ui/button.tsx") },
      // `command-palette` renders through the same two shadcn primitives every
      // plugin already installs via `data-table`'s faceted filter / dialog-form.
      { find: "@/components/ui/command", replacement: fixture("components/ui/command.tsx") },
      { find: "@/components/ui/dialog", replacement: fixture("components/ui/dialog.tsx") },
      { find: "lucide-react", replacement: fixture("types/lucide-react.tsx") },
      // Copied-sibling specifiers (`./state-error`, `./data-table`, ...), shared
      // with the `/_preview` gallery so both toolchains resolve a block the same
      // way. See fixtures/registry-sibling-aliases.ts.
      ...registrySiblingAliases()
    ]
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
