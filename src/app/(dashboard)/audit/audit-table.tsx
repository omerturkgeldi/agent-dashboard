"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAuditLogs } from "@/lib/api/audit";
import type { AuditFilter, AuditLog } from "@/lib/api/types";
import { useTablePageSize } from "@/lib/preferences";
import { actionVariant, auditActions } from "./audit-actions";
import { AuditDetailDialog } from "./audit-detail-dialog";

const ALL = "all";

const startOfDay = (date: string) => (date ? new Date(`${date}T00:00:00`).toISOString() : undefined);
const endOfDay = (date: string) => (date ? new Date(`${date}T23:59:59.999`).toISOString() : undefined);

export function AuditTable() {
  const t = useTranslations("audit");
  const locale = useLocale();
  const [action, setAction] = useState(ALL);
  const [entityName, setEntityName] = useState("");
  const [userId, setUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useTablePageSize();
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const filter: AuditFilter = {
    action: action === ALL ? undefined : action,
    entityName: entityName || undefined,
    userId: userId || undefined,
    from: startOfDay(from),
    to: endOfDay(to),
  };
  const { data, isPending, isFetching, error } = useQuery({
    queryKey: ["audit", filter, page, pageSize],
    queryFn: () => getAuditLogs(filter, page, pageSize),
    placeholderData: keepPreviousData,
  });

  const actionItems = { [ALL]: t("allActions"), ...Object.fromEntries(auditActions.map((a) => [a, t(`actions.${a}`)])) };

  // Any filter change goes back to the first page.
  const onFilter = (set: (value: string) => void) => (value: string) => {
    set(value);
    setPage(1);
  };

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: "createdAt",
      meta: { label: t("time") },
      cell: ({ getValue }) => <span className="whitespace-nowrap text-muted-foreground">{new Date(getValue<string>()).toLocaleString(locale)}</span>,
    },
    { accessorKey: "action", meta: { label: t("action") }, cell: ({ getValue }) => <Badge variant={actionVariant(getValue<string>())}>{t(`actions.${getValue<string>()}`)}</Badge> },
    { accessorKey: "userName", meta: { label: t("user") }, cell: ({ getValue }) => getValue<string | null>() ?? <span className="text-muted-foreground">{t("system")}</span> },
    { accessorKey: "entityName", meta: { label: t("entityColumn") }, cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string | null>()}</span> },
    { accessorKey: "ipAddress", meta: { label: t("ip") }, cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string | null>()}</span> },
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
            <Select value={action} items={actionItems} onValueChange={(v) => v && onFilter(setAction)(v)}>
              <SelectTrigger size="sm" className="w-44" aria-label={t("action")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(actionItems).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input className="h-8 w-44" placeholder={t("entity")} value={entityName} onChange={(e) => onFilter(setEntityName)(e.target.value)} />
            <Input className="h-8 w-36" placeholder={t("userId")} value={userId} onChange={(e) => onFilter(setUserId)(e.target.value)} />
            <Input className="h-8 w-36" type="date" aria-label={t("from")} value={from} onChange={(e) => onFilter(setFrom)(e.target.value)} />
            <Input className="h-8 w-36" type="date" aria-label={t("to")} value={to} onChange={(e) => onFilter(setTo)(e.target.value)} />
          </>
        }
      />
      <AuditDetailDialog log={selected} onClose={() => setSelected(null)} />
    </>
  );
}
