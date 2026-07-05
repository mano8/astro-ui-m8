import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";

const FIXTURE_ROOT = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(FIXTURE_ROOT, "..", "..");

export default defineConfig({
  appType: "spa",
  root: FIXTURE_ROOT,
  resolve: {
    alias: {
      "@": resolve(REPO_ROOT, "fixtures", "registry-consumer"),
      "lucide-react": resolve(FIXTURE_ROOT, "shims", "lucide-react.tsx"),
      "react-hook-form": resolve(FIXTURE_ROOT, "shims", "react-hook-form.tsx"),
      "@hookform/resolvers/zod": resolve(
        FIXTURE_ROOT,
        "shims",
        "hookform-resolvers-zod.ts",
      ),
    },
  },
  server: {
    port: 4173,
    fs: {
      allow: [REPO_ROOT],
    },
  },
  preview: {
    port: 4173,
  },
});
