import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { NotificationsList } from "./notifications-list";

export default async function NotificationsPage() {
  const t = await getTranslations("notifications");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <NotificationsList />
    </>
  );
}
