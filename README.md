# @mano8/astro-ui-m8

![CI/CD](https://github.com/mano8/astro-ui-m8/actions/workflows/CI.yaml/badge.svg?branch=main)
[![codecov](https://codecov.io/github/mano8/astro-ui-m8/graph/badge.svg?token=XF91Y8PZJQ)](https://codecov.io/github/mano8/astro-ui-m8)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/afd9d56b75d84a09a1f6b5c978e7eed9)](https://app.codacy.com/gh/mano8/astro-ui-m8/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

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

## Frozen Phase 1 contract

Phase 1 Step 2 freezes the shared naming and host import assumptions before any
consumer depends on the generated registry output.

Frozen registry item names:

- `data-table`
- `data-table-column-header`
- `data-table-pagination`
- `data-table-view-options`
- `data-table-server-toolbar`
- `data-table-server-faceted-filter`
- `toast-notification`
- `state-loading`
- `state-empty`
- `state-error`
- `state-unauthorized`
- `dialog-form`
- `table-page`

Host alias/import contract for copied registry blocks:

- shadcn primitives resolve from `@/components/ui/*`
- utility helpers resolve from `@/lib/utils`
- hosts import the canonical token bridge from
  `@mano8/astro-ui-m8/src/lib/tokens.css`

These names are frozen. As of `1.0.0` the package follows strict semver:
breaking changes to registry item names, copied-file structure, or required host
aliases are **major**-version changes.

## Commands

- `npm run build` — `tsc` → `dist/`, then `build:registry`.
- `npm run build:registry` — generate `registry/r/*.json` from `registry.json`.
- `npm run typecheck` — `tsc --noEmit`.
- `npm test` — Vitest with coverage.
- `npm run test:unit` — Vitest without coverage.

> Status: stable (`1.0.0`). Registry blocks, recipes, token bridge, list-params,
> and the test harness are in place and follow strict semver.
