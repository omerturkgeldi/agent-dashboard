"use client";

import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AuditLog } from "@/lib/api/types";
import { actionVariant } from "./audit-actions";

export function AuditDetailDialog({ log, onClose }: { log: AuditLog | null; onClose: () => void }) {
  const t = useTranslations("audit");
  const locale = useLocale();

  return (
    <Dialog open={!!log} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        {log && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Badge variant={actionVariant(log.action)}>{t(`actions.${log.action}`)}</Badge>
                {log.entityName}
              </DialogTitle>
              <DialogDescription>
                {log.userName ?? t("system")} · {new Date(log.createdAt).toLocaleString(locale)}
                {log.ipAddress && ` · ${log.ipAddress}`}
              </DialogDescription>
            </DialogHeader>

            {log.entityId && (
              <p className="text-sm text-muted-foreground">
                {t("recordId")}: <span className="font-mono">{log.entityId}</span>
              </p>
            )}

            <div className="max-h-96 overflow-auto">
              {log.changes.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noChanges")}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("field")}</TableHead>
                      <TableHead>{t("oldValue")}</TableHead>
                      <TableHead>{t("newValue")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {log.changes.map((change) => (
                      <TableRow key={change.field}>
                        <TableCell className="font-medium">{change.field}</TableCell>
                        <TableCell className="max-w-48 break-all text-muted-foreground">{change.old ?? "—"}</TableCell>
                        <TableCell className="max-w-48 break-all">{change.new ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
