import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { canAccess, findPage } from "@/lib/config/nav";
import { getCurrentUser } from "@/lib/server/current-user";
import { DashboardOverview } from "./dashboard-overview";

const allowed = (href: string, roles: string[]) => canAccess(findPage(href)!, roles);

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const user = await getCurrentUser();
  const roles = user?.roles ?? [];

  return (
    <>
      <PageHeader title={t("welcome", { name: user?.name ?? "" })} description={t("description")} />
      <DashboardOverview canSeeUsers={allowed("/users", roles)} canSeeLogs={allowed("/logs", roles)} canSeeTranslations={allowed("/translations", roles)} />
    </>
  );
}
