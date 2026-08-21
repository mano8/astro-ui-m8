import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("shared registry contract", () => {
  it("ships canonical toast and data-table row hooks", () => {
    const registry = JSON.parse(
      readFileSync(resolve("registry.json"), "utf8"),
    ) as { items: { name: string }[] };
    const table = readFileSync(
      resolve("registry/blocks/data-table/data-table.tsx"),
      "utf8",
    );
    const toast = readFileSync(
      resolve("registry/blocks/feedback/toast-notification.tsx"),
      "utf8",
    );

    expect(registry.items.some((item) => item.name === "toast-notification")).toBe(true);
    expect(table).toContain("rowAttributes");
    expect(table).toContain("getRowId");
    expect(table).toContain("createDataTableSelectionColumn");
    expect(table).toContain("toggleAllPageRowsSelected");
    expect(table).toContain("data-data-table-selection-actions");
    expect(table).toContain('className="flex justify-end py-3"');
    expect(table).toContain("onRowSelectionChange");
    expect(toast).toContain("toast.success");
    expect(toast).toContain("ToastNotificationHost");
  });

  it("ships the tree-view item with its documented hooks and a11y contract", () => {
    const registry = JSON.parse(
      readFileSync(resolve("registry.json"), "utf8"),
    ) as { items: { name: string }[] };
    const tree = readFileSync(
      resolve("registry/blocks/tree/tree-view.tsx"),
      "utf8",
    );

    expect(registry.items.some((item) => item.name === "tree-view")).toBe(true);
    expect(tree).toContain("onSelect");
    expect(tree).toContain("nodeAttributes");
    expect(tree).toContain("renderNode");
    expect(tree).toContain("selectedId");
    expect(tree).toContain("expandedIds");
    expect(tree).toContain("onExpandedChange");
    expect(tree).toContain('role="tree"');
    expect(tree).toContain('role="treeitem"');
    expect(tree).toContain("aria-level");
    expect(tree).toContain("aria-selected");
    expect(tree).toContain("aria-expanded");
  });
});
