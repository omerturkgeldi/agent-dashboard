"use client";

import { useTranslations } from "next-intl";
import { Check, Pencil, Plus } from "lucide-react";
import { Flag } from "@/components/flag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ManagedLanguage } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function LanguageCards({ languages, selected, onSelect, onAdd, onEdit }: {
  languages: ManagedLanguage[];
  selected?: string;
  onSelect: (code: string) => void;
  onAdd: () => void;
  onEdit: (language: ManagedLanguage) => void;
}) {
  const t = useTranslations("translations");

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {languages.map((language) => {
        const percent = language.total === 0 ? 100 : Math.round((language.translated * 100) / language.total);
        return (
          <div
            key={language.code}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(language.code)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(language.code)}
            className={cn(
              "group cursor-pointer rounded-xl border bg-card p-4 text-left shadow-xs transition-colors hover:bg-accent/50",
              selected === language.code && "border-primary bg-primary/5 ring-2 ring-primary",
              !language.isActive && "opacity-60",
            )}
          >
            <div className="flex items-start gap-3">
              <Flag code={language.flagCode} className="mt-1 text-2xl" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate font-medium">
                  {language.nativeName}
                  {selected === language.code && (
                    <Badge className="gap-1">
                      <Check className="size-3" /> {t("editingBadge")}
                    </Badge>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {language.name} · {language.code}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-1 size-7 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-100"
                aria-label={t("editLanguage")}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(language);
                }}
              >
                <Pencil />
              </Button>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{t("progress", { percent })}</span>
              {language.untranslated > 0 && <span>{t("missing", { count: language.untranslated })}</span>}
              {language.needsReview > 0 && <span>{t("review", { count: language.needsReview })}</span>}
              {!language.isActive && <Badge variant="outline">{t("inactive")}</Badge>}
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={onAdd}
        className="flex min-h-24 items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
      >
        <Plus className="size-4" /> {t("addLanguage")}
      </button>
    </div>
  );
}
