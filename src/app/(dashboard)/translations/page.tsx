import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { ROLES } from "@/lib/api/types";
import { getCurrentUser } from "@/lib/server/current-user";
import { TranslationsManager } from "./translations-manager";

export default async function TranslationsPage() {
  const t = await getTranslations("translations");
  const user = await getCurrentUser();
  const canDelete = !!user?.roles.some((role) => role === ROLES.SuperAdmin || role === ROLES.Admin);

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <p className="-mt-3 mb-6 max-w-3xl text-sm text-muted-foreground">{t("help")}</p>
      <TranslationsManager canDelete={canDelete} />
    </>
  );
}
