// Canonical typed label-map contract for the shared kit (`A-C5`).
//
// Every registry block that renders developer-facing copy already accepts its
// own local labels with English defaults — `data-table-pagination` and
// `tree-view` group them under a typed `*Labels` interface, `state-*` and
// `error-boundary` take individual string props. Neither shape gives a
// consuming app one place to declare a translation: adopting a second locale
// today means finding every block instance across every island and wiring its
// props by hand, one at a time.
//
// This module is that one place: a plain, non-visual contract (types and
// default values only, no rendering) published from the package root — the
// "." export — exactly like `list-params.ts`, so a host depends on it as a
// normal package import rather than reaching into registry sources. A
// registry block is copied into the consumer's own tree and stays
// self-contained per `STANDALONE-CHILD-USABILITY`, so no registry block
// imports this module; a host resolves its labels here first, then passes the
// matching slice to each block's own `labels`/string props. The render tests
// under `tests/registry/**` assert each block's *actual* rendered defaults
// against `DEFAULT_KIT_LABELS`, so the two cannot drift apart unnoticed.
export interface StateEmptyLabels {
  title: string;
  description: string;
}

export interface StateErrorLabels {
  title: string;
  description: string;
  retryLabel: string;
}

export interface StateLoadingLabels {
  title: string;
  description: string;
}

export interface StateUnauthorizedLabels {
  title: string;
  description: string;
}

export interface ErrorBoundaryLabels {
  title: string;
  description: string;
  retryLabel: string;
}

export interface CommandPaletteLabels {
  placeholder: string;
  emptyLabel: string;
  title: string;
  description: string;
}

export interface TreeViewLabels {
  empty: string;
  expand: (node: { label: string }) => string;
  collapse: (node: { label: string }) => string;
}

export interface DataTablePaginationLabels {
  selectedRows: (selected: number, total: number) => string;
  rowsPerPage: string;
  currentPage: (current: number, total: number) => string;
  goToFirstPage: string;
  goToPreviousPage: string;
  goToNextPage: string;
  goToLastPage: string;
}

export interface KitLabels {
  stateEmpty: StateEmptyLabels;
  stateError: StateErrorLabels;
  stateLoading: StateLoadingLabels;
  stateUnauthorized: StateUnauthorizedLabels;
  errorBoundary: ErrorBoundaryLabels;
  commandPalette: CommandPaletteLabels;
  treeView: TreeViewLabels;
  dataTablePagination: DataTablePaginationLabels;
}

export type KitLabelOverrides = {
  [Section in keyof KitLabels]?: Partial<KitLabels[Section]>;
};

/**
 * The exact English defaults each registry block ships today. Kept as one
 * literal object — not derived from the block source — because a consumer
 * reads this as the contract, and the render tests hold the two in sync from
 * the other direction.
 */
export const DEFAULT_KIT_LABELS: KitLabels = {
  stateEmpty: {
    title: "No results",
    description: "Nothing matches the current view."
  },
  stateError: {
    title: "Something went wrong",
    description: "The request could not be completed.",
    retryLabel: "Try again"
  },
  stateLoading: {
    title: "Loading",
    description: "Fetching the latest data."
  },
  stateUnauthorized: {
    title: "Access required",
    description: "Sign in with an account that has permission to view this page."
  },
  errorBoundary: {
    title: "This view stopped responding",
    description: "The page hit an unexpected error and could not finish rendering.",
    retryLabel: "Reload this view"
  },
  commandPalette: {
    placeholder: "Type a command or search…",
    emptyLabel: "No results found.",
    title: "Command palette",
    description: "Search commands and jump to an action."
  },
  treeView: {
    empty: "No items.",
    expand: (node) => `Expand ${node.label}`,
    collapse: (node) => `Collapse ${node.label}`
  },
  dataTablePagination: {
    selectedRows: (selected, total) => `${selected} of ${total} selected`,
    rowsPerPage: "Rows per page",
    currentPage: (current, total) => `Page ${current} of ${total}`,
    goToFirstPage: "Go to first page",
    goToPreviousPage: "Go to previous page",
    goToNextPage: "Go to next page",
    goToLastPage: "Go to last page"
  }
};

/**
 * Merges a host's overrides over `DEFAULT_KIT_LABELS`, one section at a time
 * so overriding `stateError.retryLabel` never drops `stateError.title`, and a
 * section a host never mentions is untouched.
 */
export function mergeKitLabels(overrides: KitLabelOverrides = {}): KitLabels {
  return {
    stateEmpty: { ...DEFAULT_KIT_LABELS.stateEmpty, ...overrides.stateEmpty },
    stateError: { ...DEFAULT_KIT_LABELS.stateError, ...overrides.stateError },
    stateLoading: { ...DEFAULT_KIT_LABELS.stateLoading, ...overrides.stateLoading },
    stateUnauthorized: {
      ...DEFAULT_KIT_LABELS.stateUnauthorized,
      ...overrides.stateUnauthorized
    },
    errorBoundary: { ...DEFAULT_KIT_LABELS.errorBoundary, ...overrides.errorBoundary },
    commandPalette: { ...DEFAULT_KIT_LABELS.commandPalette, ...overrides.commandPalette },
    treeView: { ...DEFAULT_KIT_LABELS.treeView, ...overrides.treeView },
    dataTablePagination: {
      ...DEFAULT_KIT_LABELS.dataTablePagination,
      ...overrides.dataTablePagination
    }
  };
}
