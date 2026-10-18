"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";

/** A checkbox column for row selection. Add it first in `columns` and set `enableRowSelection` on the table. */
export function createSelectColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => <SelectAll checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected()} onChange={(value) => table.toggleAllPageRowsSelected(value)} />,
    cell: ({ row }) => <SelectRow checked={row.getIsSelected()} onChange={(value) => row.toggleSelected(value)} />,
    enableSorting: false,
    enableHiding: false,
  };
}

function SelectAll({ checked, indeterminate, onChange }: { checked: boolean; indeterminate: boolean; onChange: (value: boolean) => void }) {
  const t = useTranslations("a11y");
  return <Checkbox aria-label={t("selectAll")} checked={checked} indeterminate={indeterminate} onCheckedChange={(value) => onChange(!!value)} />;
}

function SelectRow({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  const t = useTranslations("a11y");
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Checkbox aria-label={t("selectRow")} checked={checked} onCheckedChange={(value) => onChange(!!value)} />
    </div>
  );
}
