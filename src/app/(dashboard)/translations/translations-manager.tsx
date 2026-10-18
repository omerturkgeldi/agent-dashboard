"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/data-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getManagedLanguages } from "@/lib/api/languages";
import type { ManagedLanguage } from "@/lib/api/types";
import { LanguageCards } from "./language-cards";
import { LanguageDialog } from "./language-dialog";
import { TranslationsTable } from "./translations-table";

export function TranslationsManager({ canDelete }: { canDelete: boolean }) {
  const { data: languages, isPending, error } = useQuery({ queryKey: ["languages", "manage"], queryFn: getManagedLanguages });
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ open: boolean; language: ManagedLanguage | null }>({ open: false, language: null });
  const initialStatus = useSearchParams().get("status") ?? undefined; // the notification links here with ?status=Untranslated

  // Until one is picked: the language with the most work waiting, else the first one that is not the source language.
  const selected =
    languages?.find((l) => l.code === selectedCode) ??
    languages?.find((l) => !l.isDefault && l.untranslated > 0) ??
    languages?.find((l) => !l.isDefault) ??
    languages?.[0];

  if (error) return <ErrorState message={error.message} />;
  if (isPending) return <Skeleton className="h-40 w-full" />;

  return (
    <div className="space-y-4">
      <LanguageCards
        languages={languages}
        selected={selected?.code}
        onSelect={setSelectedCode}
        onAdd={() => setDialog({ open: true, language: null })}
        onEdit={(language) => setDialog({ open: true, language })}
      />
      {selected && <TranslationsTable key={selected.code} language={selected} languages={languages} initialStatus={initialStatus} />}
      <LanguageDialog
        key={dialog.language?.code ?? "new"}
        open={dialog.open}
        language={dialog.language}
        existing={languages.map((l) => l.code)}
        canDelete={canDelete}
        onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
        onCreated={setSelectedCode}
      />
    </div>
  );
}
