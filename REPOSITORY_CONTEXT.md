# astro-ui-m8

## Layer

Shared UI library for the M8 Astro package fleet. This is not a business plugin,
Astro integration, backend client, route owner, or Starlight configuration owner.

## Role and ownership

This package is the canonical shadcn registry source, design-token bridge, generic
list-parameters helper, and shared test harness.

- `registry/blocks/data-table/**` is the sole canonical data-table owner.
- `registry/blocks/state/**` owns loading, empty, error, and unauthorized states.
- `registry/recipes/{dialog-form,table-page}/**` owns shared recipes.
- `src/lib/list-params.ts` remains generic, `src/lib/tokens.css` is the default token
  bridge, `src/lib/labels.ts` is the canonical typed label-map contract
  (`KitLabels`/`DEFAULT_KIT_LABELS`/`mergeKitLabels`) for i18n across the kit,
  and `src/testing/**` is published as `@mano8/astro-ui-m8/testing`, including
  the shared `axe`-based a11y baseline (`expectNoA11yViolations`).

## Repository rules

- Use registry-copy first: consumers add generated `registry/r/*.json`; components
  are copied rather than runtime-imported from this package.
- Keep runtime exports limited to `.` and `./testing`. Frozen registry item names may
  not be renamed once a consumer depends on them.
- Extend shared blocks rather than creating one-off business-plugin forks. A missing
  capability needs tests, a registry rebuild, and documentation in
  `registry/README.md` when that file exists.
- Declare prerequisite runtime packages for copied blocks as `peerDependencies`;
  consumers use this package as a normal dependency.
- While registry APIs are pre-1.0, breaking data-table props, recipe structure, or
  generated item names require a minor version bump.

## Repository commands

- `npm run build`
- `npm run build:registry`
- `npm run typecheck`
- `npm test`
- `npm run test:unit`

## Standalone authority

This file and repository documentation provide the local context. A verified nearest
workspace may optionally add launcher-selected policies and tasks; its absence is a
successful standalone condition and never requires a parent workspace.
