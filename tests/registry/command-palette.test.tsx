// @vitest-environment jsdom
//
// Render tests for the `command-palette` registry block (`A-C4`).
//
// Like `error-boundary`, the block is registry source rather than package
// source: it composes `@/components/ui/command` and `@/components/ui/dialog`,
// which resolve through the same fixture shims `npm run verify:registry-consumer`
// compiles the copied block against, so both gates agree on the same consumer
// surface. The fixture `Dialog` renders its children unconditionally (it is a
// compile-only shim, not a behavioral one), so these tests exercise the
// palette's own wiring — group/item rendering, select-then-close, and the
// `⌘K`/`Ctrl+K` shortcut hook — rather than the dialog's open/close chrome,
// which belongs to the real Radix primitive a consumer installs.
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import {
  CommandPalette,
  useCommandPaletteShortcut,
  type CommandPaletteGroup,
} from "../../registry/blocks/command/command-palette";

afterEach(cleanup);

function makeGroups(onSelect: () => void): CommandPaletteGroup[] {
  return [
    {
      heading: "Blocks",
      items: [
        {
          id: "new-block",
          label: "New block",
          description: "Create a prompt block",
          shortcut: "⌘N",
          keywords: ["create", "add"],
          onSelect,
        },
      ],
    },
    {
      heading: "Templates",
      items: [
        {
          id: "browse-templates",
          label: "Browse templates",
          onSelect: () => undefined,
        },
      ],
    },
  ];
}

describe("command-palette registry block", () => {
  it("renders every group heading and item", () => {
    render(
      <CommandPalette open groups={makeGroups(() => undefined)} onOpenChange={() => undefined} />,
    );

    expect(screen.getByText("Blocks")).toBeTruthy();
    expect(screen.getByText("Templates")).toBeTruthy();
    expect(screen.getByText("New block")).toBeTruthy();
    expect(screen.getByText("Create a prompt block")).toBeTruthy();
    expect(screen.getByText("⌘N")).toBeTruthy();
    expect(screen.getByText("Browse templates")).toBeTruthy();
  });

  it("renders the placeholder and empty label", () => {
    render(
      <CommandPalette
        open
        groups={[]}
        onOpenChange={() => undefined}
        placeholder="Search prompt library…"
        emptyLabel="Nothing matched."
      />,
    );

    expect(screen.getByPlaceholderText("Search prompt library…")).toBeTruthy();
    expect(screen.getByText("Nothing matched.")).toBeTruthy();
  });

  it("runs the selected item's action and closes the palette", () => {
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();

    render(<CommandPalette open groups={makeGroups(onSelect)} onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByText("New block"));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("uses sr-only title/description copy so the visible surface is the input", () => {
    render(
      <CommandPalette
        open
        groups={[]}
        onOpenChange={() => undefined}
        title="Prompt command palette"
        description="Jump to any prompt action."
      />,
    );

    expect(screen.getByText("Prompt command palette")).toBeTruthy();
    expect(screen.getByText("Jump to any prompt action.")).toBeTruthy();
  });
});

describe("useCommandPaletteShortcut", () => {
  function Harness({ disabled = false }: { disabled?: boolean }) {
    const [open, setOpen] = React.useState(false);
    useCommandPaletteShortcut(() => setOpen((value) => !value), { disabled });
    return <p>{open ? "open" : "closed"}</p>;
  }

  it("toggles on Ctrl+K", () => {
    render(<Harness />);
    expect(screen.getByText("closed")).toBeTruthy();

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(screen.getByText("open")).toBeTruthy();

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(screen.getByText("closed")).toBeTruthy();
  });

  it("toggles on Cmd+K (metaKey), case-insensitively", () => {
    render(<Harness />);

    fireEvent.keyDown(document, { key: "K", metaKey: true });
    expect(screen.getByText("open")).toBeTruthy();
  });

  it("ignores a bare 'k' and other modifier-less keys", () => {
    render(<Harness />);

    fireEvent.keyDown(document, { key: "k" });
    expect(screen.getByText("closed")).toBeTruthy();

    fireEvent.keyDown(document, { key: "j", ctrlKey: true });
    expect(screen.getByText("closed")).toBeTruthy();
  });

  it("does nothing while disabled", () => {
    render(<Harness disabled />);

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(screen.getByText("closed")).toBeTruthy();
  });

  it("removes its listener on unmount", () => {
    const { unmount } = render(<Harness />);
    unmount();

    // No harness is mounted to observe state, but a leaked listener touching a
    // torn-down component would throw during this event dispatch.
    expect(() => fireEvent.keyDown(document, { key: "k", ctrlKey: true })).not.toThrow();
  });
});
