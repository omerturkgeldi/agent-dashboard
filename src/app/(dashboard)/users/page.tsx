import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { getCurrentUser } from "@/lib/server/current-user";
import { UsersTable } from "./users-table";

export default async function UsersPage() {
  const t = await getTranslations("users");
  const user = await getCurrentUser();
  if (!user) return null; // the dashboard layout has already redirected to /login

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <UsersTable currentUser={{ id: user.id, roles: user.roles }} />
    </>
  );
}
