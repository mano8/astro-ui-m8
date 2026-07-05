// Public runtime surface of @mano8/astro-ui-m8 (the "." export).
//
// Minimal by design. This package is a *build/registry source*: the shadcn
// blocks and recipes (data-table, state, dialog-form, table-page) are delivered
// as copied registry items — NOT runtime imports from here. The only runtime
// surface is small and stable:
//
//   - shared types consumed by plugin skins/hosts,
//   - generic list-params helpers (`src/lib/list-params.ts`),
//   - the design-token bridge (`src/lib/tokens.css`, imported as CSS),
//
// each landing in a later Phase 1 step. The test harness ships separately under
// the "./testing" export.
export {};
