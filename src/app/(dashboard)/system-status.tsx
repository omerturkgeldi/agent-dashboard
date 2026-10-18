"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getSystemStatus } from "@/lib/api/health";
import { cn } from "@/lib/utils";

/** Two dots: is the API up, does it reach its database. Checked every 30 seconds. */
export function SystemStatus() {
  const t = useTranslations("dashboard");
  const { data } = useQuery({ queryKey: ["dashboard", "health"], queryFn: getSystemStatus, refetchInterval: 30_000 });

  const items = [
    { label: t("statusApi"), up: data?.api === "up" },
    { label: t("statusDatabase"), up: data?.database === "up" },
  ];

  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{t("status")}</span>
      {items.map(({ label, up }) => (
        <span key={label} className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", !data ? "bg-muted-foreground/40" : up ? "bg-emerald-500" : "bg-destructive")} aria-hidden />
          {label}
          {data && <span className={up ? "" : "font-medium text-destructive"}>{up ? t("statusUp") : t("statusDown")}</span>}
        </span>
      ))}
    </div>
  );
}
