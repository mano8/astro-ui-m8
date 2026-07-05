# @mano8/astro-ui-m8

Canonical shared UI foundation for the M8 `astro-*-m8` plugin fleet. It is **not**
a business plugin and **not** an Astro integration — it registers no routes,
injects no integration, and fronts no backend service.

It owns:

- the canonical **shadcn registry** — `data-table` and its parts, `state`
  components (loading/empty/error/unauthorized), and the `dialog-form` /
  `table-page` recipes;
- the design-token bridge (`src/lib/tokens.css`);
- generic **list-params** helpers (`src/lib/list-params.ts`);
- the shared **test harness** (`@mano8/astro-ui-m8/testing`).

## Delivery model — registry-copy first

Shared UI is consumed via `shadcn add` against
`./node_modules/@mano8/astro-ui-m8/registry/r/{name}.json`; the files are
**copied** into the consumer app. This package is a build/registry source, not a
runtime import of those components. Runtime exports (`.`, `./testing`) are
minimal by design.

Business plugins list `@mano8/astro-ui-m8` in `dependencies` (not
devDependencies) and declare their `registryDependencies` on its registry items.
Prerequisite runtime packages for copied blocks are declared as
`peerDependencies` and documented in `registry/README.md`.

## Commands

- `npm run build` — `tsc` → `dist/`, then `build:registry`.
- `npm run build:registry` — generate `registry/r/*.json` from `registry.json`.
- `npm run typecheck` — `tsc --noEmit`.
- `npm test` — Vitest with coverage.
- `npm run test:unit` — Vitest without coverage.

> Status: scaffolding in progress (Phase 1). Registry blocks, recipes, token
> bridge, list-params, and the test harness are being added incrementally.
