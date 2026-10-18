"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getLogs } from "@/lib/api/logs";
import type { Log, LogFilter } from "@/lib/api/types";
import { LogDetailDialog } from "./log-detail-dialog";
import { levelVariant } from "./log-level";

const ALL = "all";

const startOfDay = (date: string) => (date ? new Date(`${date}T00:00:00`).toISOString() : undefined);
const endOfDay = (date: string) => (date ? new Date(`${date}T23:59:59.999`).toISOString() : undefined);

export function LogsTable() {
  const t = useTranslations("logs");
  const locale = useLocale();
  const levels = { [ALL]: t("allLevels"), Info: t("info"), Warning: t("warning"), Error: t("error") };

  const [level, setLevel] = useState(ALL);
  const [path, setPath] = useState("");
  const [userId, setUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selected, setSelected] = useState<Log | null>(null);

  const filter: LogFilter = {
    level: level === ALL ? undefined : level,
    path: path || undefined,
    userId: userId || undefined,
    from: startOfDay(from),
    to: endOfDay(to),
  };
  const { data, isPending, isFetching, error } = useQuery({
    queryKey: ["logs", filter, page, pageSize],
    queryFn: () => getLogs(filter, page, pageSize),
    placeholderData: keepPreviousData,
  });

  // Any filter change goes back to the first page.
  const onFilter = (set: (value: string) => void) => (value: string) => {
    set(value);
    setPage(1);
  };

  const columns: ColumnDef<Log>[] = [
    { accessorKey: "level", meta: { label: t("level") }, cell: ({ getValue }) => <Badge variant={levelVariant(getValue<string>())}>{getValue<string>()}</Badge> },
    { accessorKey: "message", meta: { label: t("message") }, cell: ({ getValue }) => <div className="max-w-md truncate">{getValue<string>()}</div> },
    { accessorKey: "source", meta: { label: t("source") }, cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span> },
    { accessorKey: "path", meta: { label: t("pathColumn") }, cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span> },
    {
      accessorKey: "createdAt",
      meta: { label: t("time") },
      cell: ({ getValue }) => <span className="whitespace-nowrap text-muted-foreground">{new Date(getValue<string>()).toLocaleString(locale)}</span>,
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        getRowId={(log) => log.id}
        isLoading={isPending}
        isFetching={isFetching}
        error={error?.message}
        emptyMessage={t("empty")}
        onRowClick={setSelected}
        server={{ page, pageSize, total: data?.totalCount ?? 0, onPageChange: setPage, onPageSizeChange: (size) => { setPageSize(size); setPage(1); } }}
        toolbar={
          <>
            <Select value={level} items={levels} onValueChange={(v) => v && onFilter(setLevel)(v)}>
              <SelectTrigger size="sm" className="w-36" aria-label={t("level")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(levels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input className="h-8 w-40" placeholder={t("path")} value={path} onChange={(e) => onFilter(setPath)(e.target.value)} />
            <Input className="h-8 w-36" placeholder={t("userId")} value={userId} onChange={(e) => onFilter(setUserId)(e.target.value)} />
            <Input className="h-8 w-36" type="date" aria-label={t("from")} value={from} onChange={(e) => onFilter(setFrom)(e.target.value)} />
            <Input className="h-8 w-36" type="date" aria-label={t("to")} value={to} onChange={(e) => onFilter(setTo)(e.target.value)} />
          </>
        }
      />
      <LogDetailDialog log={selected} onClose={() => setSelected(null)} />
    </>
  );
}
