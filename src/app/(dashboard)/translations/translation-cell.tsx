"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { refreshTranslations } from "@/i18n/actions";
import type { TranslationRow } from "@/lib/api/types";
import { updateTranslation } from "@/lib/api/translations";
import { cn } from "@/lib/utils";

/** The text of a row: click to edit, Enter saves, Shift+Enter is a new line, Esc cancels. */
export function TranslationCell({ row }: { row: TranslationRow }) {
  const t = useTranslations("translations");
  const tc = useTranslations("common");
  const queryClient = useQueryClient();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const mutation = useMutation({
    mutationFn: (value: string) => updateTranslation(row.keyId, row.languageCode, value),
    onSuccess: async () => {
      setEditing(false);
      await queryClient.invalidateQueries({ queryKey: ["translations"] });
      await queryClient.invalidateQueries({ queryKey: ["languages"] });
      await refreshTranslations(row.languageCode);
      router.refresh(); // the page you are looking at may use this text
    },
    onError: (error) => toast.error(error.message),
  });

  if (!editing) {
    return (
      <div className="flex min-w-56 items-start gap-1">
        <button
          type="button"
          className={cn("block w-full rounded-md px-2 py-1 text-left text-sm whitespace-pre-wrap hover:bg-accent", !row.value && "italic text-muted-foreground")}
          onClick={() => {
            setDraft(row.value ?? "");
            setEditing(true);
          }}
        >
          {row.value || t("notTranslated")}
        </button>
        {/* The English text changed after this was translated: one click says the translation is still right. */}
        {row.status === "NeedsReview" && row.value && (
          <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label={t("markReviewed")} title={t("markReviewed")} disabled={mutation.isPending} onClick={() => mutation.mutate(row.value!)}>
            <Check />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="min-w-56 space-y-2" onClick={(e) => e.stopPropagation()}>
      <Textarea
        autoFocus
        value={draft}
        rows={Math.min(6, Math.max(2, Math.ceil(row.sourceText.length / 40)))}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            mutation.mutate(draft);
          }
          if (e.key === "Escape") setEditing(false);
        }}
      />
      <div className="flex gap-1">
        <Button size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate(draft)}>
          <Check /> {tc("save")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
          <X /> {tc("cancel")}
        </Button>
      </div>
    </div>
  );
}
