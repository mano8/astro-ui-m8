import { describe, expect, it } from "vitest";

import { DEFAULT_KIT_LABELS, mergeKitLabels } from "./labels.js";

describe("kit label-map contract", () => {
  it("returns the defaults untouched when called with no overrides", () => {
    expect(mergeKitLabels()).toEqual(DEFAULT_KIT_LABELS);
    expect(mergeKitLabels({})).toEqual(DEFAULT_KIT_LABELS);
  });

  it("merges a partial override into one section without touching the rest", () => {
    const merged = mergeKitLabels({
      stateError: { retryLabel: "Réessayer" }
    });

    expect(merged.stateError).toEqual({
      title: DEFAULT_KIT_LABELS.stateError.title,
      description: DEFAULT_KIT_LABELS.stateError.description,
      retryLabel: "Réessayer"
    });
    // A section untouched by the override is the exact default object's
    // values, not a partial or dropped one.
    expect(merged.stateEmpty).toEqual(DEFAULT_KIT_LABELS.stateEmpty);
    expect(merged.dataTablePagination).toEqual(DEFAULT_KIT_LABELS.dataTablePagination);
  });

  it("merges an override into every section at once", () => {
    const merged = mergeKitLabels({
      stateEmpty: { title: "Rien trouvé" },
      stateLoading: { description: "Chargement…" },
      stateUnauthorized: { title: "Accès requis" },
      errorBoundary: { title: "Vue interrompue" },
      commandPalette: { placeholder: "Rechercher…" },
      treeView: { empty: "Aucun élément." }
    });

    expect(merged.stateEmpty.title).toBe("Rien trouvé");
    expect(merged.stateEmpty.description).toBe(DEFAULT_KIT_LABELS.stateEmpty.description);
    expect(merged.stateLoading.description).toBe("Chargement…");
    expect(merged.stateUnauthorized.title).toBe("Accès requis");
    expect(merged.errorBoundary.title).toBe("Vue interrompue");
    expect(merged.commandPalette.placeholder).toBe("Rechercher…");
    expect(merged.treeView.empty).toBe("Aucun élément.");
  });

  it("exercises every default function value directly", () => {
    expect(DEFAULT_KIT_LABELS.treeView.expand({ label: "Folder" })).toBe("Expand Folder");
    expect(DEFAULT_KIT_LABELS.treeView.collapse({ label: "Folder" })).toBe("Collapse Folder");
    expect(DEFAULT_KIT_LABELS.dataTablePagination.selectedRows(0, 0)).toBe("0 of 0 selected");
    expect(DEFAULT_KIT_LABELS.dataTablePagination.currentPage(1, 1)).toBe("Page 1 of 1");
  });

  it("preserves the function-valued fields (tree-view, data-table pagination)", () => {
    const merged = mergeKitLabels({
      treeView: { expand: (node) => `Ouvrir ${node.label}` }
    });

    expect(merged.treeView.expand({ label: "Dossier" })).toBe("Ouvrir Dossier");
    // `collapse` was not overridden, so it is still the shipped default.
    expect(merged.treeView.collapse({ label: "Dossier" })).toBe("Collapse Dossier");
    expect(merged.dataTablePagination.selectedRows(2, 10)).toBe("2 of 10 selected");
    expect(merged.dataTablePagination.currentPage(1, 5)).toBe("Page 1 of 5");
  });
});
