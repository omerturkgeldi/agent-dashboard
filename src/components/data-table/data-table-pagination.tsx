"use client";

import type { Table } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DataTablePagination<TData>({ table, pageSizeOptions, showSelection }: { table: Table<TData>; pageSizeOptions: number[]; showSelection: boolean }) {
  const t = useTranslations("dataTable");
  const { pageIndex, pageSize } = table.getState().pagination;
  const total = table.options.manualPagination ? (table.options.rowCount ?? 0) : table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="text-muted-foreground">
        {showSelection ? t("selected", { selected: table.getFilteredSelectedRowModel().rows.length, total }) : t("total", { count: total })}
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="hidden font-medium sm:inline">{t("rowsPerPage")}</span>
          <Select value={String(pageSize)} onValueChange={(value) => value && table.setPageSize(Number(value))}>
            <SelectTrigger size="sm" className="w-[4.5rem]" aria-label={t("rowsPerPage")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="font-medium">{t("page", { page: pageIndex + 1, pages: Math.max(table.getPageCount(), 1) })}</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="hidden size-8 lg:flex" aria-label={t("first")} disabled={!table.getCanPreviousPage()} onClick={() => table.setPageIndex(0)}>
            <ChevronsLeft />
          </Button>
          <Button variant="outline" size="icon" className="size-8" aria-label={t("previous")} disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon" className="size-8" aria-label={t("next")} disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            <ChevronRight />
          </Button>
          <Button variant="outline" size="icon" className="hidden size-8 lg:flex" aria-label={t("last")} disabled={!table.getCanNextPage()} onClick={() => table.setPageIndex(table.getPageCount() - 1)}>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
