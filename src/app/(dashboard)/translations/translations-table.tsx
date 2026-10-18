"use client";

import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Info, ScanSearch } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Flag } from "@/components/flag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { refreshTranslations } from "@/i18n/actions";
import { getTranslations, scanCode } from "@/lib/api/translations";
import type { ManagedLanguage, TranslationRow, TranslationStatus } from "@/lib/api/types";
import { useTablePageSize } from "@/lib/preferences";
import { ExcelMenu } from "./excel-menu";
import { TranslationCell } from "./translation-cell";

const ALL = "all";
const scopes = ["api", "ui"];
const statuses: TranslationStatus[] = ["Untranslated", "NeedsReview", "Translated"];
const statusVariant = { Untranslated: "destructive", NeedsReview: "secondary", Translated: "outline" } as const;

export function TranslationsTable({ language, languages, initialStatus }: { language: ManagedLanguage; languages: ManagedLanguage[]; initialStatus?: string }) {
  const t = useTranslations("translations");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [scope, setScope] = useState(ALL);
  const [status, setStatus] = useState(statuses.includes(initialStatus as TranslationStatus) ? initialStatus! : ALL);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useTablePageSize();

  const filter = { language: language.code, scope: scope === ALL ? undefined : scope, status: status === ALL ? undefined : status, search: search || undefined };
  const { data, isPending, isFetching, error } = useQuery({
    queryKey: ["translations", filter, page, pageSize],
    queryFn: () => getTranslations(filter, page, pageSize),
    placeholderData: keepPreviousData,
  });

  const scan = useMutation({
    mutationFn: scanCode,
    onSuccess: async (result) => {
      toast.success(
        result.added + result.sourceChanged + result.markedUnused === 0
          ? t("scanUpToDate")
          : t("scanResult", { added: result.added, changed: result.sourceChanged, unused: result.markedUnused }),
      );
      await queryClient.invalidateQueries({ queryKey: ["translations"] });
      await queryClient.invalidateQueries({ queryKey: ["languages"] });
      await refreshTranslations();
      router.refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  const scopeItems = { [ALL]: t("allScopes"), ...Object.fromEntries(scopes.map((s) => [s, t(`scopes.${s}`)])) };
  const statusItems = { [ALL]: t("allStatuses"), ...Object.fromEntries(statuses.map((s) => [s, t(`statuses.${s}`)])) };

  // Any filter change goes back to the first page.
  const onFilter = (set: (value: string) => void) => (value: string) => {
    set(value);
    setPage(1);
  };

  const columns: ColumnDef<TranslationRow>[] = [
    {
      accessorKey: "key",
      meta: { label: t("key") },
      cell: ({ row }) => (
        <div className="max-w-64 space-y-1">
          <Badge variant="outline">{t(`scopes.${row.original.scope}`)}</Badge>
          <p className="break-all font-mono text-xs">{row.original.key}</p>
          {!row.original.isUsed && <p className="text-xs text-muted-foreground">{t("unused")}</p>}
        </div>
      ),
    },
    { accessorKey: "sourceText", meta: { label: t("source") }, cell: ({ getValue }) => <p className="max-w-72 whitespace-pre-wrap text-sm text-muted-foreground">{getValue<string>()}</p> },
    { id: "translation", meta: { label: t("translation") }, cell: ({ row }) => <TranslationCell row={row.original} /> },
    { accessorKey: "status", meta: { label: t("status") }, cell: ({ getValue }) => <Badge variant={statusVariant[getValue<TranslationStatus>()]}>{t(`statuses.${getValue<TranslationStatus>()}`)}</Badge> },
    {
      accessorKey: "updatedAt",
      meta: { label: t("updated") },
      cell: ({ row }) => (
        <div className="whitespace-nowrap text-xs text-muted-foreground">
          <p>{new Date(row.original.updatedAt).toLocaleDateString(locale)}</p>
          {row.original.updatedBy && <p>{row.original.updatedBy}</p>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-lg font-semibold">
        <Flag code={language.flagCode} className="text-2xl" />
        {t("editingLanguage", { name: language.nativeName })}
        <span className="text-sm font-normal text-muted-foreground">
          {language.name} · {language.code}
        </span>
      </h2>
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        getRowId={(row) => `${row.keyId}:${row.languageCode}`}
        isLoading={isPending}
        isFetching={isFetching}
        error={error?.message}
        emptyMessage={t("empty")}
        server={{ page, pageSize, total: data?.totalCount ?? 0, onPageChange: setPage, onPageSizeChange: (size) => { setPageSize(size); setPage(1); } }}
        actions={
          <>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" disabled={scan.isPending} onClick={() => scan.mutate()}>
                <ScanSearch /> {scan.isPending ? t("scanning") : t("scan")}
              </Button>
              <Tooltip>
                <TooltipTrigger render={<button type="button" aria-label={t("scanHint")} className="rounded-full text-muted-foreground hover:text-foreground" />}>
                  <Info className="size-4" />
                </TooltipTrigger>
                <TooltipContent className="max-w-64">{t("scanHint")}</TooltipContent>
              </Tooltip>
            </div>
            <ExcelMenu language={language} languages={languages} />
          </>
        }
        toolbar={
          <>
            <Input className="h-8 w-56" placeholder={t("searchPlaceholder")} value={search} onChange={(e) => onFilter(setSearch)(e.target.value)} />
            <Select value={scope} items={scopeItems} onValueChange={(v) => v && onFilter(setScope)(v)}>
              <SelectTrigger size="sm" className="w-32" aria-label={t("scope")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(scopeItems).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} items={statusItems} onValueChange={(v) => v && onFilter(setStatus)(v)}>
              <SelectTrigger size="sm" className="w-40" aria-label={t("status")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusItems).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />
    </div>
  );
}
