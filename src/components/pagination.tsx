"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Summary text on the left, previous / next on the right. */
export function Pagination({ page, pageSize, total, summary, onPageChange }: {
  page: number;
  pageSize: number;
  total: number;
  summary: string;
  onPageChange: (page: number) => void;
}) {
  const t = useTranslations("common");
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>{summary}</span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" aria-label={t("previous")} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft />
        </Button>
        <span>
          {page} / {totalPages}
        </span>
        <Button variant="outline" size="icon" aria-label={t("next")} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
