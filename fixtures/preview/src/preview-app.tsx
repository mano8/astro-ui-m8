import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";

import { Button } from "@/components/ui/button";

import {
  DataTableServer,
  type DataTableServerProps,
} from "../../../registry/blocks/data-table/data-table";
import { DialogForm, DestructiveConfirmDialog, useZodDialogForm } from "../../../registry/recipes/dialog-form/dialog-form";
import {
  TablePage,
  type TablePageStatus,
} from "../../../registry/recipes/table-page/table-page";
import { StateEmpty } from "../../../registry/blocks/state/state-empty";
import { StateError } from "../../../registry/blocks/state/state-error";
import { StateLoading } from "../../../registry/blocks/state/state-loading";
import { StateUnauthorized } from "../../../registry/blocks/state/state-unauthorized";

type PreviewStatus = "draft" | "published" | "archived";

interface PreviewRow {
  id: string;
  name: string;
  status: PreviewStatus;
  owner: string;
}

const TABLE_PAGE_STATUSES: TablePageStatus[] = [
  "ready",
  "loading",
  "empty",
  "error",
  "unauthorized",
];

const FILTER_OPTIONS = {
  title: "Status",
  multi: true,
  options: [
    { label: "Draft", value: "draft" },
    { label: "Published", value: "published" },
    { label: "Archived", value: "archived" },
  ],
} satisfies NonNullable<DataTableServerProps<PreviewRow, unknown, string>["filterOptions"]>;

const INITIAL_ROWS: PreviewRow[] = [
  { id: "tmpl-01", name: "Canonical table", status: "draft", owner: "UI" },
  { id: "tmpl-02", name: "Dialog recipe", status: "published", owner: "Prompt" },
  { id: "tmpl-03", name: "State bundle", status: "published", owner: "Media" },
  { id: "tmpl-04", name: "Token bridge", status: "archived", owner: "Auth" },
  { id: "tmpl-05", name: "Fixture route", status: "draft", owner: "UI" },
];

const rowSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  owner: z.string().trim().min(1, "Owner is required"),
});

const columns: ColumnDef<PreviewRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => row.original.status,
  },
  {
    accessorKey: "owner",
    header: "Owner",
    cell: ({ row }) => row.original.owner,
  },
];

function sliceRows(
  rows: PreviewRow[],
  page: number,
  pageSize: number,
  q: string,
  filter: string,
) {
  const normalizedSearch = q.trim().toLowerCase();
  const selectedFilters = new Set(filter.split(",").filter(Boolean));
  const filtered = rows.filter((row) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      row.name.toLowerCase().includes(normalizedSearch) ||
      row.owner.toLowerCase().includes(normalizedSearch);
    const matchesFilter =
      selectedFilters.size === 0 || selectedFilters.has(row.status);
    return matchesSearch && matchesFilter;
  });
  const start = Math.max(0, (page - 1) * pageSize);
  return {
    filtered,
    paged: filtered.slice(start, start + pageSize),
  };
}

export function PreviewApp() {
  const [rows, setRows] = React.useState<PreviewRow[]>(INITIAL_ROWS);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(2);
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState("");
  const [tablePageStatus, setTablePageStatus] = React.useState<TablePageStatus>("ready");
  const [message, setMessage] = React.useState("Use the fixture to inspect the canonical registry blocks.");

  const form = useZodDialogForm({
    schema: rowSchema,
    defaultValues: { name: "", owner: "" },
  });

  const { filtered, paged } = React.useMemo(
    () => sliceRows(rows, page, pageSize, query, filter),
    [filter, page, pageSize, query, rows],
  );

  const effectiveTablePageData = tablePageStatus === "ready" ? paged : [];

  React.useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / Math.max(1, pageSize)));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filtered.length, page, pageSize]);

  const submitRow = async (values: z.infer<typeof rowSchema>) => {
    setRows((current) => [
      {
        id: `tmpl-${String(current.length + 1).padStart(2, "0")}`,
        name: values.name,
        owner: values.owner,
        status: "draft",
      },
      ...current,
    ]);
    form.reset({ name: "", owner: "" });
    setDialogOpen(false);
    setMessage(`Added "${values.name}" to the preview dataset.`);
  };

  const removeArchived = async () => {
    setRows((current) => current.filter((row) => row.status !== "archived"));
    setConfirmOpen(false);
    setMessage("Archived rows removed from the preview dataset.");
  };

  return (
    <main className="preview-shell">
      <section className="preview-hero">
        <p className="preview-kicker">dev-only fixture</p>
        <h1>astro-ui-m8 `/_preview`</h1>
        <p className="preview-copy">
          This fixture exercises the canonical Phase 1 UI blocks without changing the
          published package surface.
        </p>
        <div className="preview-actions">
          <Button onClick={() => setDialogOpen(true)}>Open dialog recipe</Button>
          <Button variant="outline" onClick={() => setConfirmOpen(true)}>
            Clear archived rows
          </Button>
        </div>
        <p className="preview-note">{message}</p>
      </section>

      <section className="preview-grid">
        <article className="preview-card">
          <div className="preview-card__header">
            <h2>Data table</h2>
            <p>Ready, filtered, and paginated server-table wiring.</p>
          </div>
          <DataTableServer
            columns={columns}
            data={paged}
            rowCount={filtered.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            q={query}
            onSearchChange={setQuery}
            f={filter}
            onFilterChange={setFilter}
            filterOptions={FILTER_OPTIONS}
            labels={{
              loading: "Loading preview rows...",
              empty: "No preview rows match the current filter.",
            }}
          />
        </article>

        <article className="preview-card">
          <div className="preview-card__header preview-card__header--split">
            <div>
              <h2>Table page recipe</h2>
              <p>Switch states without editing the source components.</p>
            </div>
            <label className="preview-inline-control">
              <span>Status</span>
              <select
                value={tablePageStatus}
                onChange={(event) => setTablePageStatus(event.currentTarget.value as TablePageStatus)}
              >
                {TABLE_PAGE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <TablePage
            title="Shared table recipe"
            description="Canonical prompt/media/auth/reparto consumers should layer plugin logic around this recipe."
            columns={columns}
            data={effectiveTablePageData}
            rowCount={filtered.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            q={query}
            onSearchChange={setQuery}
            f={filter}
            onFilterChange={setFilter}
            filterOptions={FILTER_OPTIONS}
            status={tablePageStatus}
            onRetry={() => {
              setTablePageStatus("ready");
              setMessage("Table page state reset to ready.");
            }}
            emptyAction={
              <Button variant="outline" onClick={() => setDialogOpen(true)}>
                Add sample row
              </Button>
            }
            unauthorizedAction={
              <Button variant="outline" onClick={() => setTablePageStatus("ready")}>
                Return to ready
              </Button>
            }
          />
        </article>
      </section>

      <section className="preview-card">
        <div className="preview-card__header">
          <h2>State components</h2>
          <p>Loading, empty, error, and unauthorized blocks rendered side by side.</p>
        </div>
        <div className="preview-state-grid">
          <StateLoading rows={4} />
          <StateEmpty
            title="No consumer installed"
            description="Use this block when a plugin mode is enabled but returns no records."
            action={<Button variant="outline" onClick={() => setDialogOpen(true)}>Seed fixture</Button>}
          />
          <StateError
            description="The preview intentionally exposes retry wiring for state components."
            onRetry={() => setMessage("Retry clicked from the error state.")}
          />
          <StateUnauthorized
            action={
              <Button variant="outline" onClick={() => setMessage("Unauthorized action clicked.")}>
                Request access
              </Button>
            }
          />
        </div>
      </section>

      <DialogForm
        form={form}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={submitRow}
        title="Add preview row"
        description="Exercises the shared dialog form recipe with lightweight local validation."
        submitLabel="Create row"
      >
        <label className="preview-field">
          <span>Name</span>
          <input {...form.register("name")} placeholder="Canonical table" />
          {form.errors.name?.message ? (
            <small className="preview-error">{form.errors.name.message}</small>
          ) : null}
        </label>
        <label className="preview-field">
          <span>Owner</span>
          <input {...form.register("owner")} placeholder="Prompt" />
          {form.errors.owner?.message ? (
            <small className="preview-error">{form.errors.owner.message}</small>
          ) : null}
        </label>
      </DialogForm>

      <DestructiveConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remove archived rows"
        description="Exercises the shared alert-dialog confirmation wrapper."
        onConfirm={removeArchived}
        confirmLabel="Remove rows"
      />
    </main>
  );
}
