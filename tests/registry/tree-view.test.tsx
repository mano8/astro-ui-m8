// @vitest-environment jsdom
//
// Render tests for the `tree-view` registry block (U6).
//
// The block is registry source, not package source: it is copied into a
// consumer app and therefore imports `@/lib/utils` plus the `lucide-react`
// peer, neither of which resolves from this repo's own `src/`. That is why
// these tests live outside `src/` (and outside the root tsconfig program, like
// every other registry block) and lean on the `resolve.alias` entries in
// `vitest.config.ts`, which point at the same registry-consumer fixture shims
// `npm run verify:registry-consumer` compiles the block against.
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";

import { TreeView, type TreeViewNode } from "../../registry/blocks/tree/tree-view";

afterEach(cleanup);

/**
 * Three levels deep on purpose: `Root A > A two > A two one` is what the
 * level, step-in and step-out assertions below need.
 *
 *   Root A (3)
 *   |- A one
 *   \- A two
 *      \- A two one
 *   Root B
 */
const NODES: TreeViewNode[] = [
  {
    id: "root-a",
    label: "Root A",
    count: 3,
    children: [
      { id: "a-1", label: "A one" },
      {
        id: "a-2",
        label: "A two",
        children: [{ id: "a-2-1", label: "A two one" }],
      },
    ],
  },
  { id: "root-b", label: "Root B" },
];

const ALL_EXPANDED = ["root-a", "a-2"];

function item(name: string): HTMLElement {
  return screen.getByRole("treeitem", { name });
}

/** Focus a treeitem the way the browser would, flushing the state it sets. */
function focusItem(name: string): void {
  act(() => {
    item(name).focus();
  });
}

function activeElement(): HTMLElement {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) {
    throw new Error("expected an element to hold focus");
  }
  return active;
}

/** Send a key to whatever currently holds focus, as a real user would. */
function press(key: string): boolean {
  return fireEvent.keyDown(activeElement(), { key });
}

function hook(attribute: string, id: string): HTMLElement {
  const element = document.querySelector(`[${attribute}="${id}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`no element matching [${attribute}="${id}"]`);
  }
  return element;
}

function tabbableIds(): (string | null)[] {
  return screen
    .getAllByRole("treeitem")
    .filter((node) => node.getAttribute("tabindex") === "0")
    .map((node) => node.getAttribute("data-tree-view-node"));
}

function selectedIds(): (string | null)[] {
  return screen
    .getAllByRole("treeitem")
    .filter((node) => node.getAttribute("aria-selected") === "true")
    .map((node) => node.getAttribute("data-tree-view-node"));
}

describe("tree-view nested rendering", () => {
  it("renders three levels with the right roles, levels and aria state", () => {
    render(
      <TreeView
        nodes={NODES}
        defaultExpandedIds={ALL_EXPANDED}
        selectedId="a-1"
        aria-label="Categories"
      />,
    );

    const tree = screen.getByRole("tree", { name: "Categories" });
    // One nested group per expanded parent.
    expect(within(tree).getAllByRole("group")).toHaveLength(2);
    expect(screen.getAllByRole("treeitem")).toHaveLength(5);

    const rootA = item("Root A 3");
    expect(rootA.getAttribute("aria-level")).toBe("1");
    expect(rootA.getAttribute("aria-expanded")).toBe("true");
    expect(rootA.getAttribute("aria-selected")).toBe("false");
    // The count is part of the accessible name, the nested group is not.
    expect(rootA.getAttribute("aria-labelledby")?.split(" ")).toHaveLength(2);

    const a1 = item("A one");
    expect(a1.getAttribute("aria-level")).toBe("2");
    expect(a1.getAttribute("aria-selected")).toBe("true");
    expect(a1.hasAttribute("aria-expanded")).toBe(false);

    expect(item("A two").getAttribute("aria-level")).toBe("2");
    expect(item("A two one").getAttribute("aria-level")).toBe("3");
    expect(item("Root B").getAttribute("aria-level")).toBe("1");
    expect(item("Root B").hasAttribute("aria-expanded")).toBe(false);
  });

  it("renders only the visible branch when a parent is collapsed", () => {
    render(<TreeView nodes={NODES} defaultExpandedIds={["root-a"]} />);

    expect(screen.getAllByRole("treeitem")).toHaveLength(4);
    expect(item("A two").getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("treeitem", { name: "A two one" })).toBeNull();
  });

  it("renders the empty slot instead of an empty tree", () => {
    const { rerender } = render(<TreeView nodes={[]} />);

    expect(screen.queryByRole("tree")).toBeNull();
    expect(screen.getByText("No items.")).toBeTruthy();

    rerender(<TreeView nodes={[]} labels={{ empty: "No categories yet." }} />);
    expect(screen.getByText("No categories yet.")).toBeTruthy();

    rerender(<TreeView nodes={[]} empty={<p>Create one to get started.</p>} />);
    expect(screen.getByText("Create one to get started.")).toBeTruthy();
  });
});

describe("tree-view expand and collapse", () => {
  it("toggles a branch by pointer without selecting it", () => {
    const onSelect = vi.fn();
    render(<TreeView nodes={NODES} onSelect={onSelect} />);

    const toggle = hook("data-tree-view-toggle", "root-a");
    expect(toggle.getAttribute("data-expanded")).toBe("false");

    fireEvent.click(toggle);
    expect(item("Root A 3").getAttribute("aria-expanded")).toBe("true");
    expect(item("A one")).toBeTruthy();
    // The toggle must not double as a selection affordance.
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.click(hook("data-tree-view-toggle", "root-a"));
    expect(item("Root A 3").getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("treeitem", { name: "A one" })).toBeNull();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("reports expansion changes and stays controlled when expandedIds is passed", () => {
    const onExpandedChange = vi.fn();
    const { rerender } = render(
      <TreeView nodes={NODES} expandedIds={[]} onExpandedChange={onExpandedChange} />,
    );

    fireEvent.click(hook("data-tree-view-toggle", "root-a"));
    expect(onExpandedChange).toHaveBeenCalledWith(["root-a"]);
    // Not applied locally: the owner still holds expandedIds={[]}.
    expect(item("Root A 3").getAttribute("aria-expanded")).toBe("false");

    rerender(
      <TreeView
        nodes={NODES}
        expandedIds={["root-a"]}
        onExpandedChange={onExpandedChange}
      />,
    );
    expect(item("Root A 3").getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(hook("data-tree-view-toggle", "root-a"));
    expect(onExpandedChange).toHaveBeenLastCalledWith([]);
  });

  it("keeps internal expansion when only defaultExpandedIds is passed", () => {
    const onExpandedChange = vi.fn();
    render(
      <TreeView
        nodes={NODES}
        defaultExpandedIds={["root-a"]}
        onExpandedChange={onExpandedChange}
      />,
    );

    fireEvent.click(hook("data-tree-view-toggle", "a-2"));
    expect(item("A two").getAttribute("aria-expanded")).toBe("true");
    expect(item("A two one")).toBeTruthy();
    expect(onExpandedChange).toHaveBeenCalledWith(["root-a", "a-2"]);
  });
});

describe("tree-view single selection", () => {
  it("reports the selected node and never marks two at once", () => {
    function SelectionHarness() {
      const [selectedId, setSelectedId] = React.useState<string | null>(null);
      return (
        <TreeView
          nodes={NODES}
          defaultExpandedIds={ALL_EXPANDED}
          selectedId={selectedId}
          onSelect={(node) => setSelectedId(node.id)}
        />
      );
    }

    render(<SelectionHarness />);
    expect(selectedIds()).toEqual([]);

    fireEvent.click(hook("data-tree-view-select", "a-1"));
    expect(selectedIds()).toEqual(["a-1"]);
    expect(item("A one").getAttribute("data-state")).toBe("selected");

    // Selecting a third-level node replaces the previous selection.
    fireEvent.click(hook("data-tree-view-select", "a-2-1"));
    expect(selectedIds()).toEqual(["a-2-1"]);
    expect(item("A one").getAttribute("data-state")).toBeNull();
  });

  it("selects a parent by row without collapsing it", () => {
    const onSelect = vi.fn();
    render(
      <TreeView nodes={NODES} defaultExpandedIds={["root-a"]} onSelect={onSelect} />,
    );

    fireEvent.click(hook("data-tree-view-select", "root-a"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].id).toBe("root-a");
    expect(item("Root A 3").getAttribute("aria-expanded")).toBe("true");
  });
});

describe("tree-view keyboard navigation", () => {
  it("walks the visible nodes with ArrowDown, ArrowUp, Home and End", () => {
    render(<TreeView nodes={NODES} defaultExpandedIds={ALL_EXPANDED} />);
    focusItem("Root A 3");

    press("ArrowDown");
    expect(activeElement()).toBe(item("A one"));
    press("ArrowDown");
    expect(activeElement()).toBe(item("A two"));
    press("ArrowDown");
    expect(activeElement()).toBe(item("A two one"));
    press("ArrowDown");
    expect(activeElement()).toBe(item("Root B"));
    // The last visible node is the end of the walk.
    press("ArrowDown");
    expect(activeElement()).toBe(item("Root B"));

    press("ArrowUp");
    expect(activeElement()).toBe(item("A two one"));
    press("Home");
    expect(activeElement()).toBe(item("Root A 3"));
    // The first visible node is the start of the walk.
    press("ArrowUp");
    expect(activeElement()).toBe(item("Root A 3"));
    press("End");
    expect(activeElement()).toBe(item("Root B"));
  });

  it("expands then steps in with ArrowRight, collapses then steps out with ArrowLeft", () => {
    render(<TreeView nodes={NODES} />);
    focusItem("Root A 3");
    expect(item("Root A 3").getAttribute("aria-expanded")).toBe("false");

    // The first press opens the branch and stays put.
    press("ArrowRight");
    expect(item("Root A 3").getAttribute("aria-expanded")).toBe("true");
    expect(activeElement()).toBe(item("Root A 3"));

    // The second steps into it.
    press("ArrowRight");
    expect(activeElement()).toBe(item("A one"));

    // A leaf ignores ArrowRight.
    press("ArrowRight");
    expect(activeElement()).toBe(item("A one"));

    // A leaf steps out to its parent.
    press("ArrowLeft");
    expect(activeElement()).toBe(item("Root A 3"));

    press("ArrowLeft");
    expect(item("Root A 3").getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("treeitem", { name: "A one" })).toBeNull();

    // A collapsed root has nowhere to step out to.
    press("ArrowLeft");
    expect(activeElement()).toBe(item("Root A 3"));
  });

  it("steps down and back up all three levels with the arrow keys", () => {
    render(<TreeView nodes={NODES} />);
    focusItem("Root A 3");

    press("ArrowRight");
    press("ArrowRight");
    press("ArrowDown");
    expect(activeElement()).toBe(item("A two"));

    press("ArrowRight");
    press("ArrowRight");
    expect(activeElement()).toBe(item("A two one"));
    expect(item("A two one").getAttribute("aria-level")).toBe("3");

    press("ArrowLeft");
    expect(activeElement()).toBe(item("A two"));
    press("ArrowLeft");
    expect(item("A two").getAttribute("aria-expanded")).toBe("false");
    press("ArrowLeft");
    expect(activeElement()).toBe(item("Root A 3"));
  });

  it("selects the focused node with Enter and Space", () => {
    const onSelect = vi.fn();
    render(
      <TreeView nodes={NODES} defaultExpandedIds={ALL_EXPANDED} onSelect={onSelect} />,
    );

    focusItem("A two one");
    press("Enter");
    press(" ");

    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect.mock.calls[0][0].id).toBe("a-2-1");
    expect(onSelect.mock.calls[1][0].id).toBe("a-2-1");
  });

  it("leaves unhandled keys to the page", () => {
    render(<TreeView nodes={NODES} />);
    focusItem("Root A 3");

    // fireEvent returns false once the handler called preventDefault().
    expect(press("a")).toBe(true);
    expect(activeElement()).toBe(item("Root A 3"));
  });

  it("keeps exactly one tabbable treeitem as focus and selection move", () => {
    const { rerender, unmount } = render(
      <TreeView nodes={NODES} defaultExpandedIds={ALL_EXPANDED} />,
    );

    // No focus and no selection yet: the first node is the way in.
    expect(tabbableIds()).toEqual(["root-a"]);

    // A selection takes over from that fallback.
    rerender(
      <TreeView nodes={NODES} defaultExpandedIds={ALL_EXPANDED} selectedId="a-2" />,
    );
    expect(tabbableIds()).toEqual(["a-2"]);

    // Focus wins over the selection, and follows the keyboard.
    focusItem("A two");
    press("ArrowDown");
    expect(tabbableIds()).toEqual(["a-2-1"]);

    unmount();

    // A focused node that gets collapsed away hands the tab stop back.
    render(
      <TreeView nodes={NODES} defaultExpandedIds={ALL_EXPANDED} selectedId="root-b" />,
    );
    focusItem("A two one");
    expect(tabbableIds()).toEqual(["a-2-1"]);
    fireEvent.click(hook("data-tree-view-toggle", "a-2"));
    expect(tabbableIds()).toEqual(["root-b"]);
  });

  it("moves the roving tabindex with a pointer press", () => {
    render(<TreeView nodes={NODES} defaultExpandedIds={ALL_EXPANDED} />);

    fireEvent.pointerDown(hook("data-tree-view-select", "a-1"));
    expect(tabbableIds()).toEqual(["a-1"]);
  });
});

describe("tree-view escape hatches", () => {
  it("names treeitems by label when renderNode owns the row markup", () => {
    const onSelect = vi.fn();
    render(
      <TreeView
        nodes={NODES}
        defaultExpandedIds={["root-a"]}
        onSelect={onSelect}
        renderNode={({ node, level, expanded, hasChildren, toggle, select }) => (
          <span
            data-testid={`custom-${node.id}`}
            data-level={level}
            data-expanded={hasChildren ? expanded : undefined}
            onClick={hasChildren ? toggle : select}
          >
            {node.label}
          </span>
        )}
      />,
    );

    const rootA = screen.getByRole("treeitem", { name: "Root A" });
    expect(rootA.getAttribute("aria-label")).toBe("Root A");
    expect(rootA.hasAttribute("aria-labelledby")).toBe(false);
    // The built-in row stands down so it cannot double-handle the click.
    expect(document.querySelector('[data-tree-view-select="root-a"]')).toBeNull();

    expect(screen.getByTestId("custom-root-a").getAttribute("data-expanded")).toBe("true");
    expect(screen.getByTestId("custom-a-1").getAttribute("data-level")).toBe("2");

    fireEvent.click(screen.getByTestId("custom-a-1"));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("spreads nodeAttributes onto the treeitem", () => {
    render(
      <TreeView
        nodes={NODES}
        defaultExpandedIds={ALL_EXPANDED}
        nodeAttributes={(node) => ({ "data-testid": `n-${node.id}` })}
      />,
    );

    expect(screen.getByTestId("n-root-a").getAttribute("role")).toBe("treeitem");
    expect(screen.getByTestId("n-a-2-1").getAttribute("aria-level")).toBe("3");
  });
});
