"use client";

// Canonical shared `⌘K` command-palette overlay for the M8 Astro plugin fleet
// (`A-C4`). `cmdk` is already a declared `astro-ui-m8` peer (pulled in
// transitively by shadcn's `command` primitive, which `data-table`'s faceted
// filter already depends on) — this block is the first thing in the registry
// that surfaces it as a standalone, host-level overlay rather than an inline
// combobox.
//
// It composes the same two shadcn primitives every plugin already installs —
// `@/components/ui/command` (the `cmdk` wrapper) and `@/components/ui/dialog`
// — rather than importing `cmdk` directly, so a host never carries two
// competing copies of the same filtering/keyboard-nav logic.

import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface CommandPaletteItem {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  /** Extra terms matched by `cmdk`'s built-in filter alongside `label`. */
  keywords?: string[];
  onSelect: () => void;
}

export interface CommandPaletteGroup {
  heading: string;
  items: CommandPaletteItem[];
}

export interface CommandPaletteProps {
  groups: CommandPaletteGroup[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  emptyLabel?: string;
  /** Dialog title/description. Rendered visually hidden (`sr-only`) — the
   * overlay's own input is the visible affordance, same as shadcn's own
   * `CommandDialog` recipe. */
  title?: string;
  description?: string;
}

/**
 * Fleet-wide `⌘K` / `Ctrl+K` listener. Exported separately from
 * `CommandPalette` so a host that drives `open` from more than one trigger
 * (a header button, a route) can register the shortcut once at whatever level
 * makes sense, rather than being forced through the dialog component itself.
 *
 * `⌘K`/`Ctrl+K` is not a native editing shortcut in any browser, so — unlike a
 * bare single-key shortcut — it is honoured even while focus sits in a text
 * field; there is deliberately no "editable target" guard to work around.
 */
export function useCommandPaletteShortcut(
  onToggle: () => void,
  options: { disabled?: boolean } = {},
): void {
  const { disabled = false } = options;
  React.useEffect(() => {
    if (disabled) return;
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key.toLowerCase() !== "k") return;
      if (!(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      onToggle();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onToggle, disabled]);
}

export function CommandPalette({
  groups,
  open,
  onOpenChange,
  placeholder = "Type a command or search…",
  emptyLabel = "No results found.",
  title = "Command palette",
  description = "Search commands and jump to an action.",
}: CommandPaletteProps) {
  const runCommand = React.useCallback(
    (action: () => void) => {
      onOpenChange(false);
      action();
    },
    [onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-m8-command-palette="dialog"
        className="overflow-hidden p-0 shadow-lg"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command shouldFilter data-m8-command-palette="command">
          <CommandInput placeholder={placeholder} autoFocus />
          <CommandList>
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            {groups.map((group, index) => (
              <React.Fragment key={group.heading}>
                {index > 0 ? <CommandSeparator /> : null}
                <CommandGroup heading={group.heading}>
                  {group.items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={[item.label, ...(item.keywords ?? [])].join(" ")}
                      onSelect={() => runCommand(item.onSelect)}
                    >
                      <div className="flex flex-1 flex-col">
                        <span>{item.label}</span>
                        {item.description ? (
                          <span className="text-xs opacity-60">{item.description}</span>
                        ) : null}
                      </div>
                      {item.shortcut ? (
                        <span className="ml-auto text-xs tracking-widest opacity-60">
                          {item.shortcut}
                        </span>
                      ) : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </React.Fragment>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
