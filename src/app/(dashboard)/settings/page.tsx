import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { getLanguages } from "@/lib/server/languages";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const t = await getTranslations("settings");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <SettingsForm languages={await getLanguages()} />
    </>
  );
}
