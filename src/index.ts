// Public runtime surface of @mano8/astro-ui-m8 (the "." export).
//
// Minimal by design. This package is a build/registry source: shadcn blocks and
// recipes are delivered as copied registry items, not runtime imports from here.
// The shared test harness ships separately under the "./testing" export.
export {
  DEFAULT_LIST_PARAMS,
  listParamsToOffset,
  offsetToListParams,
  normalizeListParams
} from "./lib/list-params.js";
export type {
  ListOffsetParams,
  ListPageParams,
  ListParamOptions,
  NormalizedListParams
} from "./lib/list-params.js";
export { DEFAULT_KIT_LABELS, mergeKitLabels } from "./lib/labels.js";
export type {
  CommandPaletteLabels,
  DataTablePaginationLabels,
  ErrorBoundaryLabels,
  KitLabelOverrides,
  KitLabels,
  StateEmptyLabels,
  StateErrorLabels,
  StateLoadingLabels,
  StateUnauthorizedLabels,
  TreeViewLabels
} from "./lib/labels.js";
