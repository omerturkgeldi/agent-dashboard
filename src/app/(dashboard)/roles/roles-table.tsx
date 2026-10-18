"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { DataTable } from "@/components/data-table";
import { getRoles } from "@/lib/api/roles";
import type { Role } from "@/lib/api/types";

export function RolesTable() {
  const t = useTranslations("roles");
  const { data: roles, isPending, error } = useQuery({ queryKey: ["roles"], queryFn: getRoles });

  const columns: ColumnDef<Role>[] = [
    { accessorKey: "name", meta: { label: t("name") }, cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span> },
    { accessorKey: "id", meta: { label: t("id") }, cell: ({ getValue }) => <span className="font-mono text-xs text-muted-foreground">{getValue<string>()}</span> },
  ];

  return <DataTable columns={columns} data={roles ?? []} getRowId={(role) => role.id} isLoading={isPending} error={error?.message} emptyMessage={t("empty")} searchable />;
}
