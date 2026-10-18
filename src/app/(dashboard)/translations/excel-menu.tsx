"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { refreshTranslations } from "@/i18n/actions";
import { exportTranslations, importTranslations } from "@/lib/api/translations";
import type { ImportResult, ManagedLanguage } from "@/lib/api/types";
import { ImportResultDialog } from "./import-result-dialog";

/** Translate in Excel: download the texts, fill in a language column, upload the file again. */
export function ExcelMenu({ language, languages }: { language: ManagedLanguage; languages: ManagedLanguage[] }) {
  const t = useTranslations("translations");
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const download = useMutation({
    mutationFn: ({ languages, onlyMissing }: { languages: string[]; onlyMissing: boolean }) => exportTranslations(languages, onlyMissing),
    onError: (error) => toast.error(error.message),
  });

  const upload = useMutation({
    mutationFn: importTranslations,
    onSuccess: async (data) => {
      setResult(data);
      await queryClient.invalidateQueries({ queryKey: ["translations"] });
      await queryClient.invalidateQueries({ queryKey: ["languages"] });
      await refreshTranslations();
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="sm" variant="outline" disabled={download.isPending || upload.isPending} />}>
          <FileSpreadsheet /> {t("excel")}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-64">
          <DropdownMenuItem disabled={language.isDefault} onClick={() => download.mutate({ languages: [language.code], onlyMissing: true })}>
            <Download /> {t("exportMissing", { name: language.nativeName })}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={language.isDefault} onClick={() => download.mutate({ languages: [language.code], onlyMissing: false })}>
            <Download /> {t("exportLanguage", { name: language.nativeName })}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => download.mutate({ languages: [], onlyMissing: false })}>
            <Download /> {t("exportAll")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => fileInput.current?.click()}>
            <Upload /> {t("import")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={fileInput}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload.mutate(file);
          e.target.value = ""; // the same file can be chosen again
        }}
      />
      <ImportResultDialog result={result} languages={languages} onClose={() => setResult(null)} />
    </>
  );
}
