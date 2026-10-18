"use client";

import { useMemo, useState } from "react";
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/data-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import type { DataTableFilter, ServerPagination } from "./types";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  data: TData[];
  isLoading?: boolean;
  /** True while a new page or filter is loading and the old rows are still shown. */
  isFetching?: boolean;
  error?: string;
  emptyMessage?: string;

  /** Client-side tables: a search box over all text columns, and multi-select filters on columns. */
  searchable?: boolean;
  filters?: DataTableFilter[];

  /** Server-side tables: the API pages the data. Sorting and search are then up to your own toolbar (children). */
  server?: ServerPagination;

  /** Custom filters (server-side tables) shown in the toolbar. */
  toolbar?: React.ReactNode;
  /** Buttons on the right of the toolbar, e.g. "New". */
  actions?: React.ReactNode;

  onRowClick?: (row: TData) => void;
  enableRowSelection?: boolean;
  getRowId?: (row: TData) => string;
  pageSizeOptions?: number[];
  initialPageSize?: number;
}

/**
 * One table for every list. Define `columns` (TanStack Table) with `meta: { label }` and pass the rows.
 * - Client-side (default): sorting, search, filters and paging happen in the browser.
 * - Server-side (`server`): paging comes from the API, the table only shows the current page.
 */
export function DataTable<TData>({
  columns,
  data,
  isLoading,
  isFetching,
  error,
  emptyMessage,
  searchable = false,
  filters = [],
  server,
  toolbar,
  actions,
  onRowClick,
  enableRowSelection,
  getRowId,
  pageSizeOptions = [10, 20, 50, 100],
  initialPageSize = 10,
}: DataTableProps<TData>) {
  const t = useTranslations("dataTable");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: initialPageSize });

  // A new search or filter shows the first page again. (TanStack's own auto reset warns on the first render.)
  const showFirstPage = () => setPagination((current) => (current.pageIndex === 0 ? current : { ...current, pageIndex: 0 }));

  // Columns that give only a `meta.label` get the standard header (sort and hide menu).
  const tableColumns = useMemo(
    () =>
      columns.map((column) =>
        column.header || !column.meta?.label
          ? column
          : ({ ...column, header: ({ column: c }: { column: Column<TData, unknown> }) => <DataTableColumnHeader column={c} title={column.meta!.label!} /> } as ColumnDef<TData, any>), // eslint-disable-line @typescript-eslint/no-explicit-any
      ),
    [columns],
  );

  // TanStack Table returns functions the React Compiler cannot memoize; the table re-renders normally, so this is safe.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: tableColumns,
    getRowId,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
      pagination: server ? { pageIndex: server.page - 1, pageSize: server.pageSize } : pagination,
    },
    enableRowSelection,
    enableSorting: !server, // the API decides the order of a server-side table
    onSortingChange: setSorting,
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater);
      showFirstPage();
    },
    onGlobalFilterChange: (updater) => {
      setGlobalFilter(updater);
      showFirstPage();
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const current = server ? { pageIndex: server.page - 1, pageSize: server.pageSize } : pagination;
      const next = typeof updater === "function" ? updater(current) : updater;
      if (!server) return setPagination(next);
      if (next.pageSize !== current.pageSize) server.onPageSizeChange?.(next.pageSize);
      else server.onPageChange(next.pageIndex + 1);
    },
    manualPagination: !!server,
    rowCount: server?.total,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: server ? undefined : getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    autoResetPageIndex: false,
  });

  const visibleColumns = table.getVisibleLeafColumns().length;

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} searchable={searchable} filters={filters} actions={actions}>
        {toolbar}
      </DataTableToolbar>

      {error ? (
        <ErrorState message={error} />
      ) : (
        <div className={cn("overflow-hidden rounded-lg border transition-opacity", isFetching && !isLoading && "opacity-60")}>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: visibleColumns }, (_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    className={cn(onRowClick && "cursor-pointer")}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={visibleColumns} className="h-24 text-center text-muted-foreground">
                    {emptyMessage ?? t("noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} showSelection={!!enableRowSelection} />
    </div>
  );
}
