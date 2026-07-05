import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";

import { DataTableColumnHeader } from "./components/m8-ui/data-table-column-header";
import { DataTableServer } from "./components/m8-ui/data-table";
import { DialogForm, useZodDialogForm } from "./components/m8-ui/dialog-form";
import { StateEmpty } from "./components/m8-ui/state-empty";
import { StateError } from "./components/m8-ui/state-error";
import { StateLoading } from "./components/m8-ui/state-loading";
import { StateUnauthorized } from "./components/m8-ui/state-unauthorized";
import { TablePage } from "./components/m8-ui/table-page";

interface Row {
  id: string;
  name: string;
  status: "draft" | "published";
}

const rows: Row[] = [{ id: "1", name: "Example", status: "draft" }];

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader<Row, unknown> column={column} title="Name" />
    ),
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => row.original.status,
  },
];

const formSchema = z.object({
  name: z.string().min(1),
});

export function RegistryConsumerFixture() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const form = useZodDialogForm({
    schema: formSchema,
    defaultValues: { name: "" },
  });

  return (
    <main>
      <DataTableServer
        columns={columns}
        data={rows}
        rowCount={rows.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        q=""
        onSearchChange={() => undefined}
        f=""
        onFilterChange={() => undefined}
        filterOptions={{
          title: "Status",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
          ],
        }}
      />
      <TablePage
        title="Rows"
        columns={columns}
        data={rows}
        rowCount={rows.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
      <DialogForm
        form={form}
        open={false}
        onOpenChange={() => undefined}
        onSubmit={() => undefined}
        title="Edit row"
      >
        <input {...form.register("name")} />
      </DialogForm>
      <StateLoading />
      <StateEmpty />
      <StateError />
      <StateUnauthorized />
    </main>
  );
}
