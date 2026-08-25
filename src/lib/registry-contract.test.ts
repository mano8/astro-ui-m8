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

  it("ships the error-boundary item over the canonical state-error fallback", () => {
    const registry = JSON.parse(
      readFileSync(resolve("registry.json"), "utf8"),
    ) as { items: { name: string; files: { path: string }[] }[] };
    const boundary = readFileSync(
      resolve("registry/blocks/feedback/error-boundary.tsx"),
      "utf8",
    );

    const item = registry.items.find((entry) => entry.name === "error-boundary");
    expect(item).toBeDefined();
    // The block renders `state-error`, so the item has to carry that file too —
    // otherwise `shadcn add error-boundary` installs a component whose import
    // does not resolve.
    expect(item?.files.map((file) => file.path)).toContain(
      "registry/blocks/state/state-error.tsx",
    );

    expect(boundary).toContain("getDerivedStateFromError");
    expect(boundary).toContain("componentDidCatch");
    expect(boundary).toContain("resetKeys");
    expect(boundary).toContain("onError");
    expect(boundary).toContain('data-m8-error-boundary="fallback"');
    expect(boundary).toContain("StateError");
  });

  it("ships the command-palette item over the shared command and dialog primitives", () => {
    const registry = JSON.parse(
      readFileSync(resolve("registry.json"), "utf8"),
    ) as { items: { name: string; registryDependencies?: string[] }[] };
    const palette = readFileSync(
      resolve("registry/blocks/command/command-palette.tsx"),
      "utf8",
    );

    const item = registry.items.find((entry) => entry.name === "command-palette");
    expect(item).toBeDefined();
    expect(item?.registryDependencies).toContain("command");
    expect(item?.registryDependencies).toContain("dialog");

    // Composes the shared shadcn `command`/`dialog` primitives rather than
    // importing `cmdk` directly, so a host never carries two copies of the
    // same filtering/keyboard-nav logic.
    expect(palette).toContain('from "@/components/ui/command"');
    expect(palette).toContain('from "@/components/ui/dialog"');
    expect(palette).not.toContain('from "cmdk"');
    expect(palette).toContain("useCommandPaletteShortcut");
    expect(palette).toContain("metaKey");
    expect(palette).toContain("ctrlKey");
  });

  it("freezes every shipped item name", () => {
    const registry = JSON.parse(
      readFileSync(resolve("registry.json"), "utf8"),
    ) as { items: { name: string }[] };
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8")) as {
      mano8RegistryContract: { frozenItemNames: string[] };
    };

    // Adding an item without freezing its name is how a consumer ends up
    // depending on a name this package never promised to keep.
    expect([...pkg.mano8RegistryContract.frozenItemNames].sort()).toEqual(
      registry.items.map((item) => item.name).sort(),
    );
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
