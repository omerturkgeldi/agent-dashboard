import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { RolesTable } from "./roles-table";

export default async function RolesPage() {
  const t = await getTranslations("roles");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <RolesTable />
    </>
  );
}
