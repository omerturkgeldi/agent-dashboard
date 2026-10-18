"use client";

import { useTranslations } from "next-intl";
import { Flag } from "@/components/flag";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ImportResult, ManagedLanguage } from "@/lib/api/types";

export function ImportResultDialog({
  result,
  languages,
  onClose,
}: {
  result: ImportResult | null;
  languages: ManagedLanguage[];
  onClose: () => void;
}) {
  const t = useTranslations("translations");

  return (
    <Dialog open={!!result} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        {result && (
          <>
            <DialogHeader>
              <DialogTitle>{t("importDone")}</DialogTitle>
              <DialogDescription>
                {result.languages.length === 0
                  ? t("importNothing")
                  : t("importDoneHint")}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 space-y-4 overflow-auto">
              {result.languages.map((language) => {
                const known = languages.find(
                  (l) => l.code === language.language,
                );
                return (
                  <div key={language.language} className="space-y-1">
                    <p className="flex items-center gap-2 font-medium">
                      <Flag code={known?.flagCode} />{" "}
                      {known?.nativeName ?? language.language}
                      <span className="text-sm font-normal text-muted-foreground">
                        {known ? `${known.name} · ${known.code}` : ""}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("importCounts", {
                        updated: language.updated,
                        unchanged: language.unchanged,
                        errors: language.errors.length,
                      })}
                    </p>
                    {language.errors.length > 0 && (
                      <ul className="space-y-0.5 rounded-md bg-muted p-2 text-xs">
                        {language.errors.slice(0, 20).map((error) => (
                          <li key={`${error.scope}:${error.key}`}>
                            <span className="font-mono">{error.key}</span> -{" "}
                            {t(`importReasons.${error.reason}`)}
                          </li>
                        ))}
                        {language.errors.length > 20 && (
                          <li>
                            {t("importMoreErrors", {
                              count: language.errors.length - 20,
                            })}
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                );
              })}
              {result.ignoredColumns.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("importIgnored", {
                    columns: result.ignoredColumns.join(", "),
                  })}
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
