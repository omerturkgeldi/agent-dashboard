import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { LogsTable } from "./logs-table";

export default async function LogsPage() {
  const t = await getTranslations("logs");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <LogsTable />
    </>
  );
}
