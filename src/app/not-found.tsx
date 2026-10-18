import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/status-page";

export default async function NotFound() {
  const t = await getTranslations("errors");

  return (
    <StatusPage icon={FileQuestion} title={t("notFoundTitle")} description={t("notFoundDescription")}>
      <Button render={<Link href="/" />} nativeButton={false}>
        {t("backToDashboard")}
      </Button>
    </StatusPage>
  );
}
