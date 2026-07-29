"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  DataTableServerFacetedFilter,
  type DataTableServerFacetedFilterLabels,
  type FacetedFilterOption,
} from "./data-table-server-faceted-filter";
import {
  DataTableViewOptions,
  type DataTableViewOptionsLabels,
} from "./data-table-view-options";

export interface DataTableFilterOptions {
  title: string;
  options: FacetedFilterOption[];
  multi?: boolean;
}

export interface DataTableServerToolbarLabels {
  search: string;
  reset: string;
  viewOptions: Partial<DataTableViewOptionsLabels>;
  facetedFilter: Partial<DataTableServerFacetedFilterLabels>;
}

const DEFAULT_LABELS: DataTableServerToolbarLabels = {
  search: "Search",
  reset: "Reset",
  viewOptions: {},
  facetedFilter: {},
};

interface DataTableServerToolbarProps<TData, TFilter extends string> {
  table: Table<TData>;
  addButton?: React.ReactNode;
  q?: string;
  onSearchChange?: (q: string) => void;
  f?: TFilter | "";
  onFilterChange?: (f: TFilter | "") => void;
  filterOptions?: DataTableFilterOptions;
  labels?: Partial<DataTableServerToolbarLabels>;
}

interface DataTableSearchControlsProps {
  initialQuery: string;
  onSearchChange: (query: string) => void;
  searchLabel: string;
  resetLabel: string;
}

function DataTableSearchControls({
  initialQuery,
  onSearchChange,
  searchLabel,
  resetLabel,
}: DataTableSearchControlsProps) {
  const [qSearch, setQSearch] = React.useState(initialQuery);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder={searchLabel}
        value={qSearch}
        onChange={(event) => setQSearch(event.target.value)}
        className="h-8 w-[150px] lg:w-[250px]"
        aria-label={searchLabel}
      />
      <Button
        variant="ghost"
        className="h-8 px-2 lg:px-3"
        onClick={() => onSearchChange(qSearch)}
      >
        {searchLabel}
        <Search className="ml-2 size-4" />
      </Button>
      {qSearch ? (
        <Button
          variant="ghost"
          onClick={() => {
            setQSearch("");
            onSearchChange("");
          }}
          className="h-8 px-2 lg:px-3"
        >
          {resetLabel}
          <X className="ml-2 size-4" />
        </Button>
      ) : null}
    </div>
  );
}

export function DataTableServerToolbar<TData, TFilter extends string>({
  table,
  addButton,
  q,
  onSearchChange,
  f,
  onFilterChange,
  filterOptions,
  labels,
}: DataTableServerToolbarProps<TData, TFilter>) {
  const t = { ...DEFAULT_LABELS, ...labels };

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {onSearchChange ? (
          <DataTableSearchControls
            key={q ?? ""}
            initialQuery={q ?? ""}
            onSearchChange={onSearchChange}
            searchLabel={t.search}
            resetLabel={t.reset}
          />
        ) : null}
        {onFilterChange && filterOptions ? (
          <DataTableServerFacetedFilter
            title={filterOptions.title}
            options={filterOptions.options}
            value={f ?? ""}
            onFilterChange={onFilterChange}
            labels={t.facetedFilter}
            multi={filterOptions.multi}
          />
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} labels={t.viewOptions} />
        {addButton}
      </div>
    </div>
  );
}
