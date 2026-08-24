# Registry Guide

`@mano8/astro-ui-m8` is the canonical shadcn registry source for the M8 Astro
package fleet. Consumers copy generated items from
`@mano8/astro-ui-m8/registry/r/*.json` into their own app codebase; they do not
runtime-import these copied UI blocks from this package.

## Contract

- Keep `@mano8/astro-ui-m8` in `dependencies`, not `devDependencies`.
- Add items from `./node_modules/@mano8/astro-ui-m8/registry/r/{name}.json`.
- Provide shadcn aliases for `@/components/ui/*` and `@/lib/utils`.
- Import the canonical token bridge from
  `@mano8/astro-ui-m8/src/lib/tokens.css`.
- Treat generated item names as frozen during adoption:
  `data-table`, `data-table-column-header`, `data-table-pagination`,
  `data-table-view-options`, `data-table-server-toolbar`,
  `data-table-server-faceted-filter`, `toast-notification`, `error-boundary`,
  `command-palette`, `state-loading`, `state-empty`,
  `state-error`, `state-unauthorized`, `dialog-form`, `table-page`, `tree-view`.

## Required Packages

Copied blocks expect these runtime packages in the host app:

- `react`, `react-dom`
- `@tanstack/react-table`
- `@tanstack/react-query`
- `react-hook-form`, `@hookform/resolvers`, `zod`
- `lucide-react`
- `class-variance-authority`, `clsx`, `tailwind-merge`
- `sonner`

## Toast notifications

Install `toast-notification`, mount `ToastNotificationHost` once in the
interactive shell, and use `toastNotification.success`, `.error`, or `.info`
from mutation callbacks. The item composes the shadcn Sonner primitive.
`ToastNotificationHost` accepts an optional `position` prop
(default `"top-right"`); pass e.g. `position="bottom-right"` to move the
toast stack.
- `@radix-ui/react-alert-dialog`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-label`
- `@radix-ui/react-popover`
- `@radix-ui/react-select`
- `@radix-ui/react-separator`
- `@radix-ui/react-slot`

Each registry item also declares its direct `registryDependencies` on the shadcn
primitives it needs.

## Install Examples

Install the full controlled table:

```bash
npx shadcn@latest add ./node_modules/@mano8/astro-ui-m8/registry/r/data-table.json
```

Install only the shared page recipe:

```bash
npx shadcn@latest add ./node_modules/@mano8/astro-ui-m8/registry/r/table-page.json
```

## Item Reference

### `data-table`

Copies the canonical controlled server table stack:

- `data-table.tsx`
- `data-table-column-header.tsx`
- `data-table-pagination.tsx`
- `data-table-server-toolbar.tsx`
- `data-table-server-faceted-filter.tsx`
- `data-table-view-options.tsx`

Main props on `DataTableServer<TData, TValue, TFilter>`:

- `columns`, `data`, `rowCount`, `page`, `pageSize`
- `onPageChange(page)`, `onPageSizeChange(pageSize)`
- optional server controls: `sortBy`, `sortDir`, `onSortChange`
- optional query controls: `q`, `onSearchChange`, `f`, `onFilterChange`,
  `filterOptions`
- optional UI controls: `addButton`, `visibility`, `pageSizeOptions`, `labels`
- optional controlled row selection: `rowSelection`, `onRowSelectionChange`
- `createDataTableSelectionColumn(labels)` for the first-column visible-row
  select-all checkbox and accessible row checkboxes
- optional `selectionActions`, rendered above and below the table with vertical
  padding (consumers provide localized action content and selected-row count)
- optional loading state: `loading`

Behavior:

- controlled pagination with 1-based `page`
- manual sorting and filtering when callbacks are provided
- duplicated top/bottom pagination
- select-all applies only to the rows visible on the current page
- duplicated top/bottom selection actions when `selectionActions` is provided
- loading and empty labels overrideable through `labels`

Use `src/lib/list-params.ts` when a backend speaks `skip`/`limit` and the UI
speaks `page`/`pageSize`.

### `state-loading`

`StateLoading` props:

- `title?`
- `description?`
- `rows?`

### `state-empty`

`StateEmpty` props:

- `title?`
- `description?`
- `action?`
- `icon?`

### `state-error`

`StateError` props:

- `title?`
- `description?`
- `retryLabel?`
- `onRetry?`
- `action?`

### `error-boundary`

Copies `error-boundary.tsx` alongside `state-error.tsx`, which it renders as its
default fallback. Wrap each island root: a render throw otherwise unmounts the
whole island and leaves the host page with a blank region.

`ErrorBoundary` props:

- `children`
- `fallback?` — `({ error, reset }) => ReactNode`, replacing the default surface
- `onError?` — `(error, { componentStack })`; the block never logs on its own
- `resetKeys?` — clears the boundary when any member changes (`Object.is`, by
  position), so navigating away from the input that threw recovers without a
  reload
- `title?`, `description?`, `retryLabel?` — copy for the default fallback

The default fallback renders `data-m8-error-boundary="fallback"` as a test hook
and deliberately **does not** render the caught message: a render throw carries
whatever the failing code put in it. Read the detail from `onError`, or pass
your own `fallback`.

```tsx
<ErrorBoundary resetKeys={[processId]} onError={(error) => report(error)}>
  <LibraryView />
</ErrorBoundary>
```

### `command-palette`

A shared `⌘K`/`Ctrl+K` overlay: a `Dialog`-wrapped, grouped `Command` list, plus
a keyboard-shortcut hook exported on its own so a host can wire the toggle from
wherever makes sense (a header button, a route). Composes the same
`@/components/ui/command` and `@/components/ui/dialog` primitives `table-page`
and `dialog-form` already require, rather than importing `cmdk` directly —
`cmdk` stays a single, host-owned copy.

`CommandPalette` props:

- `groups` — `{ heading, items }[]`; each item is
  `{ id, label, description?, shortcut?, keywords?, onSelect }`
- `open`, `onOpenChange` — controlled; the block never manages its own open
  state
- `placeholder?`, `emptyLabel?` — copy for the input and the no-match state
- `title?`, `description?` — dialog title/description, rendered `sr-only`; the
  visible affordance is the input itself, same as shadcn's own `CommandDialog`
  recipe

`useCommandPaletteShortcut(onToggle, { disabled? })` attaches a document-level
`keydown` listener for `⌘K`/`Ctrl+K` (case-insensitive, cleaned up on unmount)
and calls `onToggle` — it does not touch `open` itself, so it composes with any
state a host already has.

```tsx
const [open, setOpen] = useState(false);
useCommandPaletteShortcut(() => setOpen((value) => !value));

<CommandPalette
  open={open}
  onOpenChange={setOpen}
  groups={[
    {
      heading: "Blocks",
      items: [{ id: "new-block", label: "New block", onSelect: createBlock }],
    },
  ]}
/>;
```

### `state-unauthorized`

`StateUnauthorized` props:

- `title?`
- `description?`
- `action?`

### `dialog-form`

Shared form/dialog recipe exports:

- `useZodDialogForm({ schema, defaultValues, ...options })`
- `DialogForm`
- `DestructiveConfirmDialog`

`DialogForm` expects:

- a `react-hook-form` `form`
- controlled `open` / `onOpenChange`
- `onSubmit`
- `title`
- optional `description`, `trigger`, `formId`
- optional button labels via `submitLabel`, `cancelLabel`
- optional `submitting`

`DestructiveConfirmDialog` expects:

- controlled `open` / `onOpenChange`
- `title`, `description`
- optional `confirmLabel`, `cancelLabel`
- optional `confirming`
- `onConfirm`

### `table-page`

`TablePage` composes the canonical states plus `DataTableServer`.

Extra props beyond the table props:

- `title`
- optional `description`
- optional `actions`
- optional `status`: `ready | loading | empty | error | unauthorized`
- optional `stateLabels`
- optional `onRetry`
- optional `unauthorizedAction`
- optional `emptyAction`

Default status resolution is:

- `loading` when `loading === true`
- `empty` when there is no data
- otherwise `ready`

### `tree-view`

Copies `tree-view.tsx`. A domain-agnostic, controlled tree: no data fetching,
no business types, and no `registryDependencies` — it composes only `cn`
(`@/lib/utils`) and a `lucide-react` chevron.

`TreeView` props:

- `nodes: TreeViewNode[]` — `{ id, label, children?, count?, icon? }`
- `selectedId?`, `onSelect?(node)` — controlled selection
- `expandedIds?`, `onExpandedChange?(expandedIds)` — controlled expansion;
  omit both and expansion is internal, seeded from `defaultExpandedIds`
- `renderNode?(context)` — escape hatch for custom row markup; `context`
  carries `node`, `level`, `expanded`, `selected`, `hasChildren`, `toggle`,
  `select`
- `nodeAttributes?(node)` — spread onto each node's `<li>`, mirroring the
  data-table's `rowAttributes` convention
- `labels?` — overridable `empty`/`expand`/`collapse` copy
- `empty?` — overridable empty-state slot
- `aria-label` / `aria-labelledby` — required to name the tree for
  assistive tech (no default; the consumer supplies one)

Behavior and accessibility:

- `role="tree"` on the root, `role="group"` on nested lists, `role="treeitem"`
  on each node with `aria-level`, `aria-selected`, and `aria-expanded`
  (parents only)
- roving tabindex: the last-focused visible node, else the selected node,
  else the first node, is the sole tabbable treeitem
- keyboard: ArrowUp/ArrowDown move across visible nodes, Home/End jump to the
  ends, ArrowRight opens a closed branch then steps into it, ArrowLeft closes
  an open branch then steps out to its parent, Enter/Space select
- `data-tree-view-node`, `data-tree-view-toggle`, `data-tree-view-select`,
  and `data-tree-view-count` test hooks are attached per node

## Accessibility and i18n baseline (`A-C5`)

Every block that renders developer-facing copy already accepts its own local
labels with English defaults — `data-table-pagination` and `tree-view` group
them under a typed `*Labels` interface, `state-*` and `error-boundary` take
individual string props. That leaves no single place to declare a
translation: adopting a second locale means finding every block instance
across every island and wiring its props by hand.

`@mano8/astro-ui-m8` (the package root, not a registry item — see
[Versioning](#versioning) for why registry items stay copy-only) exports a
typed contract for exactly that:

- `KitLabels` — one interface with a section per block
  (`stateEmpty`, `stateError`, `stateLoading`, `stateUnauthorized`,
  `errorBoundary`, `commandPalette`, `treeView`, `dataTablePagination`).
- `DEFAULT_KIT_LABELS` — the exact English defaults each block ships today,
  kept honest by render tests that assert each block's actual default text
  against this constant.
- `mergeKitLabels(overrides)` — merges a host's overrides over the defaults,
  one section at a time, so overriding `stateError.retryLabel` never drops
  `stateError.title`.

Resolve labels once, then pass the matching section to each block's own
`labels`/string props — no registry item imports this module, so a copied
block stays self-contained:

```ts
import { mergeKitLabels } from "@mano8/astro-ui-m8";

const labels = mergeKitLabels({
  stateError: { retryLabel: "Réessayer" },
});

<StateError {...labels.stateError} onRetry={retry} />
<DataTablePagination table={table} labels={labels.dataTablePagination} />
```

`@mano8/astro-ui-m8/testing` exports the kit's `axe`-based a11y baseline
alongside the request/query-client helpers:

- `expectNoA11yViolations(container, options?)` — runs `jest-axe`'s `axe` and
  throws with the offending rule id, its impact, and the affected node's HTML
  when a violation is found, rather than a bare boolean assertion. `jest-axe`
  is imported lazily on first call, not at module load, so a consumer that
  never calls this stays free of the dependency.

`expectNoA11yViolations` does not need `jest-axe`'s own matcher
(`toHaveNoViolations`), which targets Jest's `expect`, not Vitest's — but a
consumer that wants the matcher directly registers it once, the same way this
package's own suite does in `fixtures/vitest.setup.ts`:

```ts
import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);
```

## Extend-Not-Fork Rule

Do not create one-off copies of the data table or shared state blocks inside
business plugins. If a plugin needs missing shared capability:

1. Add it in `astro-ui-m8`.
2. Add or update tests.
3. Rebuild `registry/r` with `npm.cmd run build:registry`.
4. Document the contract change here.
5. Consume the updated registry item downstream.

## Versioning

`astro-ui-m8` is still `0.x`. Breaking changes to item names, copied-file
structure, recipe contracts, or required host aliases require a minor version
bump while the package stays pre-1.0.
