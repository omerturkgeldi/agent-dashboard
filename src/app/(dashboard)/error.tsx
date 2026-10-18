"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/status-page";

// Rendered inside the dashboard layout, so the sidebar and header stay usable.
export default function DashboardError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage icon={TriangleAlert} title={t("errorTitle")} description={t("errorDescription")}>
      <Button onClick={() => retry()}>{t("retry")}</Button>
      {error.digest && <p className="font-mono text-xs text-muted-foreground">{t("reference", { digest: error.digest })}</p>}
    </StatusPage>
  );
}
