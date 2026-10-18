"use client";

import { useTranslations } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface RowAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  destructive?: boolean;
}

/** The "..." menu at the end of a row. Destructive actions are listed last, after a separator. */
export function DataTableRowActions({ actions }: { actions: RowAction[] }) {
  const t = useTranslations("dataTable");
  const normal = actions.filter((a) => !a.destructive);
  const destructive = actions.filter((a) => a.destructive);

  return (
    <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-8 data-popup-open:bg-muted" aria-label={t("actions")} />}>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          {normal.map((a) => (
            <DropdownMenuItem key={a.label} onClick={a.onClick}>
              {a.icon && <a.icon />} {a.label}
            </DropdownMenuItem>
          ))}
          {normal.length > 0 && destructive.length > 0 && <DropdownMenuSeparator />}
          {destructive.map((a) => (
            <DropdownMenuItem key={a.label} variant="destructive" onClick={a.onClick}>
              {a.icon && <a.icon />} {a.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
