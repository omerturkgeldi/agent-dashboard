"use client";

import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Log } from "@/lib/api/types";
import { levelVariant } from "./log-level";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) =>
  children ? (
    <div className="grid gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="break-all text-sm">{children}</dd>
    </div>
  ) : null;

export function LogDetailDialog({ log, onClose }: { log: Log | null; onClose: () => void }) {
  const t = useTranslations("logs");
  const locale = useLocale();

  return (
    <Dialog open={!!log} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        {log && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Badge variant={levelVariant(log.level)}>{log.level}</Badge>
                {t("details")}
              </DialogTitle>
              <DialogDescription>{new Date(log.createdAt).toLocaleString(locale)}</DialogDescription>
            </DialogHeader>
            <dl className="grid gap-3">
              <Field label={t("message")}>{log.message}</Field>
              <Field label={t("source")}>{log.source}</Field>
              <Field label={t("pathColumn")}>{log.path}</Field>
              <Field label={t("userLabel")}>{log.userId}</Field>
              <div className="grid gap-0.5">
                <dt className="text-xs text-muted-foreground">{t("exception")}</dt>
                <dd>
                  {log.exception ? (
                    <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">{log.exception}</pre>
                  ) : (
                    <span className="text-sm text-muted-foreground">{t("noException")}</span>
                  )}
                </dd>
              </div>
            </dl>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
