"use client";

import * as React from "react";
import type { SortDescriptor } from "react-aria-components";
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
import {
  deploymentColumns,
  deployments,
  type Deployment,
  type DeploymentColumnId,
} from "@/data/deployments";

const statusStyles: Record<Deployment["status"], string> = {
  ready: "border-brand/40 text-brand",
  building: "border-amber-500/40 text-amber-600 dark:text-amber-400",
  error: "border-destructive/40 text-destructive",
};

const pagerButton =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/80 text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

const PAGE_SIZE = 5;

export default function LabPage() {
  const [filter, setFilter] = React.useState("");
  const [page, setPage] = React.useState(0);
  /** Null until the visitor sorts, which is also React Aria's "unsorted". */
  const [sort, setSort] = React.useState<SortDescriptor | null>(null);

  // Seven static rows: filtering, sorting and paging are cheaper to do here
  // than to hand to a table library.
  const filtered = React.useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return deployments;
    return deployments.filter((row) =>
      Object.values(row).some((value) => value.toLowerCase().includes(needle))
    );
  }, [filter]);

  const rows = React.useMemo(() => {
    if (!sort) return filtered;
    const key = sort.column as DeploymentColumnId;
    const ordered = [...filtered].sort((a, b) => a[key].localeCompare(b[key]));
    return sort.direction === "descending" ? ordered.reverse() : ordered;
  }, [filtered, sort]);

  const pageCount = Math.max(Math.ceil(rows.length / PAGE_SIZE), 1);
  const currentPage = Math.min(page, pageCount - 1);
  const visible = rows.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

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
            A sandbox for the primitives this site is built from. Below: React
            Aria&apos;s table primitive driving my own markup, so sorting and
            keyboard navigation come from the library, and the styling stays
            mine.
          </p>
        </header>

        <section className="mt-12 overflow-hidden rounded-lg border border-border/80">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={filter}
                onChange={(event) => {
                  setFilter(event.target.value);
                  setPage(0);
                }}
                placeholder="Filter deployments…"
                aria-label="Filter deployments"
                className="w-52 bg-transparent font-mono text-xs outline-hidden placeholder:text-muted-foreground/60"
              />
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              {rows.length} rows
            </span>
          </div>

          <div className="overflow-x-auto">
            <Table
              aria-label="Deployments"
              sortDescriptor={sort ?? undefined}
              onSortChange={(descriptor) => {
                setSort(descriptor);
                setPage(0);
              }}
            >
              <TableHeader className="border-b border-border/70">
                {deploymentColumns.map((column) => {
                  const active = sort?.column === column.id;
                  return (
                    <TableHead
                      key={column.id}
                      id={column.id}
                      isRowHeader={column.id === "id"}
                      allowsSorting
                      className="h-12 cursor-default px-4 font-mono text-[11px] leading-5 uppercase tracking-[0.14em] text-muted-foreground outline-hidden transition-colors hover:text-foreground focus-visible:text-foreground"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {column.label}
                        {active ? (
                          sort.direction === "ascending" ? (
                            <ArrowUp className="h-3 w-3 text-brand" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-brand" />
                          )
                        ) : null}
                      </span>
                    </TableHead>
                  );
                })}
              </TableHeader>
              <TableBody
                renderEmptyState={() => (
                  <div className="py-10 text-center font-mono text-xs text-muted-foreground">
                    No deployments match that filter.
                  </div>
                )}
              >
                {visible.map((row) => (
                  <TableRow key={row.id} id={row.id} className="border-border/70">
                    {deploymentColumns.map((column) => (
                      <TableCell
                        key={column.id}
                        className="px-4 py-4 font-mono text-xs text-muted-foreground"
                      >
                        {column.id === "status" ? (
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
                              statusStyles[row.status]
                            )}
                          >
                            {row.status}
                          </span>
                        ) : (
                          row[column.id]
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border/70 px-4 py-3">
            <span className="font-mono text-[11px] text-muted-foreground">
              page {currentPage + 1} / {pageCount}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(value - 1, 0))}
                disabled={currentPage === 0}
                className={pagerButton}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((value) => Math.min(value + 1, pageCount - 1))
                }
                disabled={currentPage >= pageCount - 1}
                className={pagerButton}
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
