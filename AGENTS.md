# astro-ui-m8

## Authority

Read the workspace root `AGENTS.md` first. This repo follows the workspace
TypeScript policy plus `/.Codex/context/astro-plugin.md` through repo type
`astro-ui`.

## Role In The Fleet

Canonical shared UI layer. This is not a business plugin, not an Astro
integration, and not a backend client. It registers no routes, injects no
integration, owns no Starlight config, and depends on no backend service.

It is the shared shadcn registry source, design-token bridge, generic
list-params helper package, and shared test harness for the M8 Astro package
fleet.

## Ownership

- `registry/blocks/data-table/**` is the sole canonical data-table owner.
- `registry/blocks/state/**` owns loading, empty, error, and unauthorized states.
- `registry/recipes/{dialog-form,table-page}/**` owns shared recipes.
- `src/lib/list-params.ts` stays generic only.
- `src/lib/tokens.css` is the canonical default token bridge.
- `src/testing/**` is published under `@mano8/astro-ui-m8/testing`.

## Rules

- Registry-copy first: consumers add generated `registry/r/*.json`; components
  are copied, not runtime-imported from here.
- Runtime exports stay minimal: `.` and `./testing`.
- Registry item names are frozen after a consumer depends on them.
- Extend shared blocks instead of forking one-off UI into business plugins.
- Missing capabilities require tests, registry rebuild, and documentation in
  `registry/README.md` when that file exists.
- Prerequisite runtime packages for copied blocks belong in `peerDependencies`.
- Consumers depend on this package as a normal dependency.
- During `0.x`, breaking changes to data-table props, recipe structure, or
  generated item names require a minor version bump.

## Commands

Use `npm.cmd` from PowerShell when needed:

- `npm.cmd run build`
- `npm.cmd run build:registry`
- `npm.cmd run typecheck`
- `npm.cmd test`
- `npm.cmd run test:unit`
