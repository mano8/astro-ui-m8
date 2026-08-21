"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface TreeViewNode {
  id: string;
  label: string;
  children?: TreeViewNode[];
  count?: number;
  icon?: React.ReactNode;
}

export interface TreeViewLabels {
  empty: string;
  expand: (node: TreeViewNode) => string;
  collapse: (node: TreeViewNode) => string;
}

const DEFAULT_LABELS: TreeViewLabels = {
  empty: "No items.",
  expand: (node) => `Expand ${node.label}`,
  collapse: (node) => `Collapse ${node.label}`,
};

export interface TreeViewNodeContext {
  node: TreeViewNode;
  level: number;
  expanded: boolean;
  selected: boolean;
  hasChildren: boolean;
  toggle: () => void;
  select: () => void;
}

export interface TreeViewProps {
  nodes: TreeViewNode[];
  selectedId?: string | null;
  onSelect?: (node: TreeViewNode) => void;
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  onExpandedChange?: (expandedIds: string[]) => void;
  renderNode?: (context: TreeViewNodeContext) => React.ReactNode;
  nodeAttributes?: (node: TreeViewNode) => React.LiHTMLAttributes<HTMLLIElement>;
  labels?: Partial<TreeViewLabels>;
  empty?: React.ReactNode;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

/** One entry of the depth-first list of currently visible nodes. */
interface TreeViewFlatNode {
  node: TreeViewNode;
  level: number;
  parentId: string | null;
  hasChildren: boolean;
  expanded: boolean;
}

function flattenVisibleNodes(
  nodes: TreeViewNode[],
  expanded: ReadonlySet<string>,
  level: number,
  parentId: string | null,
  out: TreeViewFlatNode[],
): TreeViewFlatNode[] {
  for (const node of nodes) {
    const children = node.children ?? [];
    const hasChildren = children.length > 0;
    const isExpanded = hasChildren && expanded.has(node.id);
    out.push({ node, level, parentId, hasChildren, expanded: isExpanded });
    if (isExpanded) {
      flattenVisibleNodes(children, expanded, level + 1, node.id, out);
    }
  }
  return out;
}

interface TreeViewItemsProps {
  nodes: TreeViewNode[];
  level: number;
  idPrefix: string;
  selectedId?: string | null;
  activeId: string | null;
  expanded: ReadonlySet<string>;
  onToggle: (node: TreeViewNode) => void;
  onSelect?: (node: TreeViewNode) => void;
  onItemKeyDown: (event: React.KeyboardEvent<HTMLLIElement>, node: TreeViewNode) => void;
  onItemFocus: (event: React.FocusEvent<HTMLLIElement>, node: TreeViewNode) => void;
  onItemPointerDown: (node: TreeViewNode) => void;
  registerItem: (id: string, element: HTMLLIElement | null) => void;
  renderNode?: (context: TreeViewNodeContext) => React.ReactNode;
  nodeAttributes?: (node: TreeViewNode) => React.LiHTMLAttributes<HTMLLIElement>;
  labels: TreeViewLabels;
}

function TreeViewItems({
  nodes,
  level,
  idPrefix,
  selectedId,
  activeId,
  expanded,
  onToggle,
  onSelect,
  onItemKeyDown,
  onItemFocus,
  onItemPointerDown,
  registerItem,
  renderNode,
  nodeAttributes,
  labels,
}: TreeViewItemsProps) {
  const items = nodes.map((node, index) => {
    const children = node.children ?? [];
    const hasChildren = children.length > 0;
    const isExpanded = hasChildren && expanded.has(node.id);
    const isSelected = selectedId === node.id;
    const itemId = `${idPrefix}-${index}`;
    const labelId = `${itemId}-label`;
    const countId = `${itemId}-count`;
    const toggle = () => onToggle(node);
    const select = () => onSelect?.(node);
    const context: TreeViewNodeContext = {
      node,
      level,
      expanded: isExpanded,
      selected: isSelected,
      hasChildren,
      toggle,
      select,
    };

    // The treeitem is named explicitly so the nested role="group" never leaks
    // into name-from-content. A custom renderNode owns its own markup, so the
    // node label is the fallback name there.
    const labelledBy = node.count === undefined ? labelId : `${labelId} ${countId}`;

    return (
      <li
        key={node.id}
        ref={(element) => {
          registerItem(node.id, element);
        }}
        role="treeitem"
        tabIndex={activeId === node.id ? 0 : -1}
        aria-level={level}
        aria-selected={isSelected}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-label={renderNode ? node.label : undefined}
        aria-labelledby={renderNode ? undefined : labelledBy}
        data-tree-view-node={node.id}
        data-state={isSelected ? "selected" : undefined}
        className="rounded-sm outline-none"
        onKeyDown={(event) => onItemKeyDown(event, node)}
        onFocus={(event) => onItemFocus(event, node)}
        {...nodeAttributes?.(node)}
      >
        <div
          data-tree-view-select={renderNode ? undefined : node.id}
          className={cn(
            "flex items-center gap-1 rounded-sm [li:focus-visible>&]:ring-2 [li:focus-visible>&]:ring-ring",
            isSelected && "bg-accent text-accent-foreground",
          )}
          onPointerDown={() => onItemPointerDown(node)}
          onClick={renderNode ? undefined : select}
        >
          {hasChildren ? (
            <span
              aria-hidden="true"
              title={isExpanded ? labels.collapse(node) : labels.expand(node)}
              data-tree-view-toggle={node.id}
              data-expanded={isExpanded}
              className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={(event) => {
                event.stopPropagation();
                toggle();
              }}
            >
              <ChevronRight
                className={cn("size-4 transition-transform", isExpanded && "rotate-90")}
              />
            </span>
          ) : (
            <span aria-hidden="true" className="size-5 shrink-0" />
          )}
          {renderNode ? (
            renderNode(context)
          ) : (
            <span
              className={cn(
                "flex min-w-0 flex-1 cursor-pointer items-center gap-2 px-2 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                isSelected && "font-medium",
              )}
            >
              {node.icon ?? null}
              <span id={labelId} className="truncate">
                {node.label}
              </span>
              {node.count === undefined ? null : (
                <span
                  id={countId}
                  data-tree-view-count={node.id}
                  className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums"
                >
                  {node.count}
                </span>
              )}
            </span>
          )}
        </div>
        {hasChildren && isExpanded ? (
          <ul role="group" className="ml-3 flex flex-col gap-0.5 border-l pl-2">
            <TreeViewItems
              nodes={children}
              level={level + 1}
              idPrefix={itemId}
              selectedId={selectedId}
              activeId={activeId}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              onItemKeyDown={onItemKeyDown}
              onItemFocus={onItemFocus}
              onItemPointerDown={onItemPointerDown}
              registerItem={registerItem}
              renderNode={renderNode}
              nodeAttributes={nodeAttributes}
              labels={labels}
            />
          </ul>
        ) : null}
      </li>
    );
  });

  return <>{items}</>;
}

export function TreeView({
  nodes,
  selectedId,
  onSelect,
  expandedIds,
  defaultExpandedIds,
  onExpandedChange,
  renderNode,
  nodeAttributes,
  labels,
  empty,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: TreeViewProps) {
  const t = { ...DEFAULT_LABELS, ...labels };
  const baseId = React.useId();
  const [internalExpandedIds, setInternalExpandedIds] = React.useState<string[]>(
    () => defaultExpandedIds ?? [],
  );
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const currentExpandedIds = expandedIds ?? internalExpandedIds;
  const expanded = React.useMemo(
    () => new Set(currentExpandedIds),
    [currentExpandedIds],
  );
  const visibleNodes = React.useMemo(
    () => flattenVisibleNodes(nodes, expanded, 1, null, []),
    [nodes, expanded],
  );

  const itemsRef = React.useRef(new Map<string, HTMLLIElement>());
  const registerItem = (id: string, element: HTMLLIElement | null) => {
    if (element === null) {
      itemsRef.current.delete(id);
    } else {
      itemsRef.current.set(id, element);
    }
  };

  // Roving tabindex: exactly one treeitem is tabbable — the last focused node
  // while it stays visible, else the selected node, else the first node.
  const isVisible = (id: string | null | undefined) =>
    id !== null && id !== undefined && visibleNodes.some((entry) => entry.node.id === id);
  let activeId: string | null = visibleNodes[0]?.node.id ?? null;
  if (isVisible(focusedId)) {
    activeId = focusedId;
  } else if (isVisible(selectedId)) {
    activeId = selectedId ?? null;
  }

  const focusItem = (id: string) => {
    setFocusedId(id);
    itemsRef.current.get(id)?.focus();
  };

  const focusAt = (index: number) => {
    const entry = visibleNodes[index];
    if (entry !== undefined) {
      focusItem(entry.node.id);
    }
  };

  const setExpansion = (node: TreeViewNode, next: boolean) => {
    if (expanded.has(node.id) === next) {
      return;
    }
    const nextIds = next
      ? [...currentExpandedIds, node.id]
      : currentExpandedIds.filter((id) => id !== node.id);
    if (expandedIds === undefined) {
      setInternalExpandedIds(nextIds);
    }
    onExpandedChange?.(nextIds);
  };

  const handleToggle = (node: TreeViewNode) => {
    setExpansion(node, !expanded.has(node.id));
  };

  // ArrowRight opens a closed branch, then steps into it; a leaf is a no-op.
  const expandOrEnter = (entry: TreeViewFlatNode, index: number) => {
    if (!entry.hasChildren) {
      return false;
    }
    if (entry.expanded) {
      focusAt(index + 1);
    } else {
      setExpansion(entry.node, true);
    }
    return true;
  };

  // ArrowLeft closes an open branch, else steps out to the parent.
  const collapseOrLeave = (entry: TreeViewFlatNode) => {
    if (entry.hasChildren && entry.expanded) {
      setExpansion(entry.node, false);
      return true;
    }
    if (entry.parentId === null) {
      return false;
    }
    focusItem(entry.parentId);
    return true;
  };

  const applyKey = (key: string, entry: TreeViewFlatNode, index: number) => {
    switch (key) {
      case "ArrowDown":
        focusAt(index + 1);
        return true;
      case "ArrowUp":
        focusAt(index - 1);
        return true;
      case "Home":
        focusAt(0);
        return true;
      case "End":
        focusAt(visibleNodes.length - 1);
        return true;
      case "ArrowRight":
        return expandOrEnter(entry, index);
      case "ArrowLeft":
        return collapseOrLeave(entry);
      case "Enter":
      case " ":
        onSelect?.(entry.node);
        return true;
      default:
        return false;
    }
  };

  const handleItemKeyDown = (
    event: React.KeyboardEvent<HTMLLIElement>,
    node: TreeViewNode,
  ) => {
    // Only the treeitem that actually holds focus reacts; the event bubbles
    // through every ancestor treeitem on its way out.
    if (event.target !== event.currentTarget) {
      return;
    }
    const index = visibleNodes.findIndex((entry) => entry.node.id === node.id);
    if (index === -1) {
      return;
    }
    if (applyKey(event.key, visibleNodes[index], index)) {
      event.preventDefault();
    }
  };

  const handleItemFocus = (
    event: React.FocusEvent<HTMLLIElement>,
    node: TreeViewNode,
  ) => {
    if (event.target === event.currentTarget) {
      setFocusedId(node.id);
    }
  };

  // A pointer press moves the roving tabindex with it, so a later Tab leaves
  // the tree from the node the user last touched.
  const handleItemPointerDown = (node: TreeViewNode) => {
    focusItem(node.id);
  };

  return (
    <div className={cn("w-full", className)} data-tree-view="">
      {nodes.length === 0 ? (
        (empty ?? <p className="px-2 py-1 text-sm text-muted-foreground">{t.empty}</p>)
      ) : (
        <ul
          role="tree"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className="flex flex-col gap-0.5"
        >
          <TreeViewItems
            nodes={nodes}
            level={1}
            idPrefix={baseId}
            selectedId={selectedId}
            activeId={activeId}
            expanded={expanded}
            onToggle={handleToggle}
            onSelect={onSelect}
            onItemKeyDown={handleItemKeyDown}
            onItemFocus={handleItemFocus}
            onItemPointerDown={handleItemPointerDown}
            registerItem={registerItem}
            renderNode={renderNode}
            nodeAttributes={nodeAttributes}
            labels={t}
          />
        </ul>
      )}
    </div>
  );
}
