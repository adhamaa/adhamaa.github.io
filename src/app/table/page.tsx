"use client";

import * as React from "react";
import {
  flexRender,
  type MRT_ColumnDef,
  useMantineReactTable,
} from "mantine-react-table";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Deployment = {
  id: string;
  branch: string;
  env: "production" | "preview";
  status: "ready" | "building" | "error";
  duration: string;
  commit: string;
};

const deployments: Deployment[] = [
  { id: "dpl_9fa21", branch: "main", env: "production", status: "ready", duration: "48s", commit: "feat: command palette" },
  { id: "dpl_9f8c4", branch: "feat/stack-grid", env: "preview", status: "ready", duration: "41s", commit: "refactor: token colours" },
  { id: "dpl_9f7b0", branch: "fix/marquee", env: "preview", status: "error", duration: "12s", commit: "fix: reduced-motion guard" },
  { id: "dpl_9f6aa", branch: "main", env: "production", status: "ready", duration: "52s", commit: "chore: bump next" },
  { id: "dpl_9f512", branch: "feat/about", env: "preview", status: "building", duration: "—", commit: "wip: about rail" },
  { id: "dpl_9f4d8", branch: "feat/seo", env: "preview", status: "ready", duration: "39s", commit: "feat: metadata + og" },
  { id: "dpl_9f3c1", branch: "main", env: "production", status: "ready", duration: "45s", commit: "feat: dark-first tokens" },
];

const statusStyles: Record<Deployment["status"], string> = {
  ready: "border-brand/40 text-brand",
  building: "border-amber-500/40 text-amber-600 dark:text-amber-400",
  error: "border-destructive/40 text-destructive",
};

const columns: MRT_ColumnDef<Deployment>[] = [
  { accessorKey: "id", header: "Deployment" },
  { accessorKey: "commit", header: "Commit" },
  { accessorKey: "branch", header: "Branch" },
  { accessorKey: "env", header: "Env" },
  {
    accessorKey: "status",
    header: "Status",
    Cell: ({ cell }) => {
      const status = cell.getValue<Deployment["status"]>();
      return (
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
            statusStyles[status]
          )}
        >
          {status}
        </span>
      );
    },
  },
  { accessorKey: "duration", header: "Duration" },
];

export default function LabPage() {
  const table = useMantineReactTable({
    columns,
    data: React.useMemo(() => deployments, []),
    enableSorting: true,
    initialState: {
      pagination: { pageSize: 5, pageIndex: 0 },
      showGlobalFilter: true,
    },
  });

  const { globalFilter, pagination } = table.getState();

  return (
    <div className="relative">
      <div
        aria-hidden
        className="grid-backdrop pointer-events-none absolute inset-x-0 top-0 -z-10 h-80"
      />

      <div className="container py-16 sm:py-24">
        <header className="max-w-2xl">
          <span className="label">
            <span className="text-brand">{"//"}</span> lab
          </span>
          <h1 className="mt-6 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Component lab
            <span className="text-brand">.</span>
          </h1>
          <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
            A sandbox for the primitives this site is built from. Below: a
            headless table — TanStack&apos;s engine driving my own markup, so
            sorting, filtering and pagination stay logic, and the styling stays
            mine.
          </p>
        </header>

        <section className="mt-12 overflow-hidden rounded-lg border border-border/80">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={globalFilter ?? ""}
                onChange={(event) => table.setGlobalFilter(event.target.value)}
                placeholder="Filter deployments…"
                aria-label="Filter deployments"
                className="w-52 bg-transparent font-mono text-xs outline-hidden placeholder:text-muted-foreground/60"
              />
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              {table.getFilteredRowModel().rows.length} rows
            </span>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {headerGroup.headers.map((header) => {
                      const sorted = header.column.getIsSorted();
                      return (
                        <TableHead key={header.id} className="whitespace-nowrap">
                          {header.isPlaceholder ? null : (
                            <button
                              type="button"
                              onClick={header.column.getToggleSortingHandler()}
                              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors hover:text-foreground"
                            >
                              {flexRender(
                                header.column.columnDef.Header ??
                                  header.column.columnDef.header,
                                header.getContext()
                              )}
                              {sorted === "asc" ? (
                                <ArrowUp className="h-3 w-3 text-brand" />
                              ) : sorted === "desc" ? (
                                <ArrowDown className="h-3 w-3 text-brand" />
                              ) : null}
                            </button>
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="whitespace-nowrap font-mono text-xs text-muted-foreground"
                      >
                        {flexRender(
                          cell.column.columnDef.Cell ??
                            cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="py-10 text-center font-mono text-xs text-muted-foreground"
                    >
                      No deployments match that filter.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border/70 px-4 py-3">
            <span className="font-mono text-[11px] text-muted-foreground">
              page {pagination.pageIndex + 1} / {Math.max(table.getPageCount(), 1)}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/80 text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/80 text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <p className="mt-6 font-mono text-[11px] text-muted-foreground/70">
          Sample data — the point is the interaction, not the numbers.
        </p>
      </div>
    </div>
  );
}
