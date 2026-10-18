"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { KeyRound, Laptop, Pencil, Plus, Power, PowerOff, Trash2 } from "lucide-react";
import { DataTable, DataTableRowActions } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRoles } from "@/lib/api/roles";
import type { User } from "@/lib/api/types";
import { canManageUser } from "@/lib/users/permissions";
import { getUsers } from "@/lib/api/users";
import { DeactivateUserDialog, useSetUserActive } from "./deactivate-user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import { UserFormDialog } from "./user-form-dialog";
import { UserDetailSheet } from "./user-detail-sheet";

export function UsersTable({ currentUser }: { currentUser: Pick<User, "id" | "roles"> }) {
  const t = useTranslations("users");
  const tc = useTranslations("common");
  const router = useRouter();
  const { data: users, isPending, error } = useQuery({ queryKey: ["users"], queryFn: getUsers });
  const { data: roles } = useQuery({ queryKey: ["roles"], queryFn: getRoles });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [deactivating, setDeactivating] = useState<User | null>(null);
  const [resetting, setResetting] = useState<User | null>(null);
  const [viewing, setViewing] = useState<User | null>(null);
  const activate = useSetUserActive();

  // The sidebar's "New user" button links to /users?new=1.
  const createRequested = useSearchParams().get("new") === "1";

  function openForm(user: User | null) {
    setEditing(user);
    setFormOpen(true);
  }

  function onFormOpenChange(open: boolean) {
    setFormOpen(open);
    if (!open && createRequested) router.replace("/users");
  }

  const columns: ColumnDef<User>[] = [
    {
      id: "name",
      accessorFn: (user) => user.displayName || `${user.name} ${user.surname}`,
      meta: { label: t("name") },
      cell: ({ row, getValue }) => (
        <span className="flex items-center gap-2 font-medium">
          {getValue<string>()}
          {row.original.id === currentUser.id && <Badge variant="outline">{t("you")}</Badge>}
        </span>
      ),
    },
    {
      accessorKey: "email",
      meta: { label: t("email") },
      cell: ({ getValue }) => <span className="text-muted-foreground">{getValue<string>()}</span>,
    },
    {
      accessorKey: "roles",
      meta: { label: t("roles") },
      enableSorting: false,
      filterFn: "arrIncludesSome",
      getUniqueValues: (user) => user.roles,
      cell: ({ getValue }) => (
        <div className="flex flex-wrap gap-1">
          {getValue<string[]>().map((role) => (
            <Badge key={role} variant="secondary">{role}</Badge>
          ))}
        </div>
      ),
    },
    {
      id: "status",
      accessorFn: (user) => (user.isActive ? "active" : "inactive"),
      meta: { label: t("status") },
      filterFn: "arrIncludesSome",
      cell: ({ row }) =>
        row.original.isActive ? <Badge variant="outline">{t("active")}</Badge> : <Badge variant="destructive">{t("inactive")}</Badge>,
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        // Nothing to offer on your own row or on a user you may not manage; the backend enforces the same rule.
        if (!canManageUser(currentUser, user)) return null;
        return (
          <DataTableRowActions
            actions={[
              { label: tc("edit"), icon: Pencil, onClick: () => openForm(user) },
              user.isActive
                ? { label: t("deactivate"), icon: PowerOff, onClick: () => setDeactivating(user) }
                : { label: t("activate"), icon: Power, onClick: () => activate.mutate({ id: user.id, isActive: true }) },
              { label: t("resetPassword"), icon: KeyRound, onClick: () => setResetting(user) },
              { label: t("sessions"), icon: Laptop, onClick: () => setViewing(user) },
              { label: tc("delete"), icon: Trash2, destructive: true, onClick: () => setDeleting(user) },
            ]}
          />
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={users ?? []}
        getRowId={(user) => user.id}
        isLoading={isPending}
        // Click a row to manage that user. Not offered on your own row or users you may not manage.
        onRowClick={(user) => canManageUser(currentUser, user) && setViewing(user)}
        error={error?.message}
        emptyMessage={t("empty")}
        searchable
        filters={[
          { column: "roles", title: t("roles"), options: (roles ?? []).map((role) => ({ label: role.name, value: role.name })) },
          { column: "status", title: t("status"), options: [{ label: t("active"), value: "active" }, { label: t("inactive"), value: "inactive" }] },
        ]}
        actions={
          <Button size="sm" onClick={() => openForm(null)}>
            <Plus /> {t("new")}
          </Button>
        }
      />
      <UserFormDialog open={formOpen || createRequested} onOpenChange={onFormOpenChange} user={editing} currentUser={currentUser} />
      <DeleteUserDialog user={deleting} onClose={() => setDeleting(null)} />
      <DeactivateUserDialog user={deactivating} onClose={() => setDeactivating(null)} />
      <ResetPasswordDialog user={resetting} onClose={() => setResetting(null)} />
      <UserDetailSheet
        user={viewing}
        onClose={() => setViewing(null)}
        actions={{
          onEdit: openForm,
          onDeactivate: setDeactivating,
          onActivate: (user) => activate.mutate({ id: user.id, isActive: true }),
          onResetPassword: setResetting,
          onDelete: setDeleting,
        }}
      />
    </>
  );
}
