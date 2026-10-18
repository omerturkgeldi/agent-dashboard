import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { AuditTable } from "./audit-table";

export default async function AuditPage() {
  const t = await getTranslations("audit");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <AuditTable />
    </>
  );
}
