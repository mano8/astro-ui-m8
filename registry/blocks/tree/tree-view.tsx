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
}

interface TreeViewBranchProps {
  nodes: TreeViewNode[];
  level: number;
  selectedId?: string | null;
  expanded: ReadonlySet<string>;
  onToggle: (node: TreeViewNode) => void;
  onSelect?: (node: TreeViewNode) => void;
  renderNode?: (context: TreeViewNodeContext) => React.ReactNode;
  nodeAttributes?: (node: TreeViewNode) => React.LiHTMLAttributes<HTMLLIElement>;
  labels: TreeViewLabels;
}

function TreeViewBranch({
  nodes,
  level,
  selectedId,
  expanded,
  onToggle,
  onSelect,
  renderNode,
  nodeAttributes,
  labels,
}: TreeViewBranchProps) {
  return (
    <ul className={cn("flex flex-col gap-0.5", level > 1 && "ml-3 border-l pl-2")}>
      {nodes.map((node) => {
        const children = node.children ?? [];
        const hasChildren = children.length > 0;
        const isExpanded = hasChildren && expanded.has(node.id);
        const isSelected = selectedId === node.id;
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

        return (
          <li
            key={node.id}
            data-tree-view-node={node.id}
            data-state={isSelected ? "selected" : undefined}
            {...nodeAttributes?.(node)}
          >
            <div className="flex items-center gap-1">
              {hasChildren ? (
                <button
                  type="button"
                  aria-label={isExpanded ? labels.collapse(node) : labels.expand(node)}
                  data-tree-view-toggle={node.id}
                  data-expanded={isExpanded}
                  className="flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={toggle}
                >
                  <ChevronRight
                    aria-hidden="true"
                    className={cn("size-4 transition-transform", isExpanded && "rotate-90")}
                  />
                </button>
              ) : (
                <span aria-hidden="true" className="size-5 shrink-0" />
              )}
              {renderNode ? (
                renderNode(context)
              ) : (
                <button
                  type="button"
                  data-tree-view-select={node.id}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2 rounded-sm px-2 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected && "bg-accent font-medium text-accent-foreground",
                  )}
                  onClick={select}
                >
                  {node.icon ?? null}
                  <span className="truncate">{node.label}</span>
                  {node.count === undefined ? null : (
                    <span
                      data-tree-view-count={node.id}
                      className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums"
                    >
                      {node.count}
                    </span>
                  )}
                </button>
              )}
            </div>
            {hasChildren && isExpanded ? (
              <TreeViewBranch
                nodes={children}
                level={level + 1}
                selectedId={selectedId}
                expanded={expanded}
                onToggle={onToggle}
                onSelect={onSelect}
                renderNode={renderNode}
                nodeAttributes={nodeAttributes}
                labels={labels}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
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
}: TreeViewProps) {
  const t = { ...DEFAULT_LABELS, ...labels };
  const [internalExpandedIds, setInternalExpandedIds] = React.useState<string[]>(
    () => defaultExpandedIds ?? [],
  );
  const currentExpandedIds = expandedIds ?? internalExpandedIds;
  const expanded = React.useMemo(
    () => new Set(currentExpandedIds),
    [currentExpandedIds],
  );

  const handleToggle = (node: TreeViewNode) => {
    const next = expanded.has(node.id)
      ? currentExpandedIds.filter((id) => id !== node.id)
      : [...currentExpandedIds, node.id];
    if (expandedIds === undefined) {
      setInternalExpandedIds(next);
    }
    onExpandedChange?.(next);
  };

  return (
    <div className={cn("w-full", className)} data-tree-view="">
      {nodes.length === 0 ? (
        (empty ?? <p className="px-2 py-1 text-sm text-muted-foreground">{t.empty}</p>)
      ) : (
        <TreeViewBranch
          nodes={nodes}
          level={1}
          selectedId={selectedId}
          expanded={expanded}
          onToggle={handleToggle}
          onSelect={onSelect}
          renderNode={renderNode}
          nodeAttributes={nodeAttributes}
          labels={t}
        />
      )}
    </div>
  );
}
