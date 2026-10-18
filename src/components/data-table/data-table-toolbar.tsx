"use client";

import type { Table } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";
import type { DataTableFilter } from "./types";

/** Search, filters and the columns menu. `children` is for custom filters (server-side tables). */
export function DataTableToolbar<TData>({ table, searchable, filters, children, actions }: {
  table: Table<TData>;
  searchable: boolean;
  filters: DataTableFilter[];
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const t = useTranslations("dataTable");
  const isFiltered = table.getState().columnFilters.length > 0 || !!table.getState().globalFilter;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {searchable && (
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="h-8 pl-8"
          />
        </div>
      )}
      {filters.map((filter) => (
        <DataTableFacetedFilter key={filter.column} column={table.getColumn(filter.column)} title={filter.title} options={filter.options} />
      ))}
      {isFiltered && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => {
            table.resetColumnFilters();
            table.setGlobalFilter("");
          }}
        >
          {t("reset")} <X />
        </Button>
      )}
      {children}
      <div className="ml-auto flex items-center gap-2">
        {actions}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
