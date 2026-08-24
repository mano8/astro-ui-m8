import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";

import { registrySiblingAliases } from "../registry-sibling-aliases.js";

const FIXTURE_ROOT = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(FIXTURE_ROOT, "..", "..");

export default defineConfig({
  appType: "spa",
  root: FIXTURE_ROOT,
  resolve: {
    alias: [
      { find: "@", replacement: resolve(REPO_ROOT, "fixtures", "registry-consumer") },
      {
        find: "lucide-react",
        replacement: resolve(FIXTURE_ROOT, "shims", "lucide-react.tsx"),
      },
      {
        find: "react-hook-form",
        replacement: resolve(FIXTURE_ROOT, "shims", "react-hook-form.tsx"),
      },
      {
        find: "@hookform/resolvers/zod",
        replacement: resolve(FIXTURE_ROOT, "shims", "hookform-resolvers-zod.ts"),
      },
      // The gallery renders blocks straight from source, so it needs the same
      // copied-sibling resolution the render tests use. Without it every
      // `table-page` sibling is an unresolved import — which is the state this
      // fixture was actually in before `A-C2`, unnoticed because no CI job ran
      // `preview:build`.
      ...registrySiblingAliases(),
    ],
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
