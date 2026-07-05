"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import {
  DataTableServer,
  type DataTableServerProps,
} from "./data-table";
import { StateEmpty } from "./state-empty";
import { StateError } from "./state-error";
import { StateLoading } from "./state-loading";
import { StateUnauthorized } from "./state-unauthorized";

export type TablePageStatus = "ready" | "loading" | "empty" | "error" | "unauthorized";

export interface TablePageStateLabels {
  loadingTitle: string;
  loadingDescription: string;
  emptyTitle: string;
  emptyDescription: string;
  errorTitle: string;
  errorDescription: string;
  unauthorizedTitle: string;
  unauthorizedDescription: string;
}

const DEFAULT_STATE_LABELS: TablePageStateLabels = {
  loadingTitle: "Loading",
  loadingDescription: "Fetching the latest data.",
  emptyTitle: "No results",
  emptyDescription: "Nothing matches the current view.",
  errorTitle: "Something went wrong",
  errorDescription: "The request could not be completed.",
  unauthorizedTitle: "Access required",
  unauthorizedDescription: "Sign in with an account that has permission to view this page.",
};

export interface TablePageProps<TData, TValue, TFilter extends string = string>
  extends DataTableServerProps<TData, TValue, TFilter> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  status?: TablePageStatus;
  stateLabels?: Partial<TablePageStateLabels>;
  onRetry?: () => void;
  unauthorizedAction?: React.ReactNode;
  emptyAction?: React.ReactNode;
}

export function TablePage<TData, TValue, TFilter extends string = string>({
  title,
  description,
  actions,
  status,
  stateLabels,
  onRetry,
  unauthorizedAction,
  emptyAction,
  columns,
  data,
  loading,
  ...tableProps
}: TablePageProps<TData, TValue, TFilter>) {
  const labels = { ...DEFAULT_STATE_LABELS, ...stateLabels };
  const resolvedStatus =
    status ?? (loading ? "loading" : data.length === 0 ? "empty" : "ready");

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-normal">{title}</h2>
          {description ? (
            <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>

      {resolvedStatus === "loading" ? (
        <StateLoading
          title={labels.loadingTitle}
          description={labels.loadingDescription}
        />
      ) : null}
      {resolvedStatus === "error" ? (
        <StateError
          title={labels.errorTitle}
          description={labels.errorDescription}
          onRetry={onRetry}
        />
      ) : null}
      {resolvedStatus === "unauthorized" ? (
        <StateUnauthorized
          title={labels.unauthorizedTitle}
          description={labels.unauthorizedDescription}
          action={unauthorizedAction}
        />
      ) : null}
      {resolvedStatus === "empty" ? (
        <StateEmpty
          title={labels.emptyTitle}
          description={labels.emptyDescription}
          action={emptyAction}
        />
      ) : null}
      {resolvedStatus === "ready" ? (
        <DataTableServer<TData, TValue, TFilter>
          columns={columns as ColumnDef<TData, TValue>[]}
          data={data}
          loading={loading}
          {...tableProps}
        />
      ) : null}
    </section>
  );
}
