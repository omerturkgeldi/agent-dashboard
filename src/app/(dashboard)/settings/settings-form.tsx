"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Flag } from "@/components/flag";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { setLocale } from "@/i18n/actions";
import { PAGE_SIZE_OPTIONS, setPreference, usePreferences } from "@/lib/preferences";
import type { PublicLanguage } from "@/lib/server/languages";

const THEMES = ["light", "dark", "system"] as const;
const noop = () => () => {};

/** Every setting applies as soon as it changes; there is no save button. */
export function SettingsForm({ languages }: { languages: PublicLanguage[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const preferences = usePreferences();

  // next-themes only knows the theme in the browser: show the select once mounted, so the server HTML matches.
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  async function changeLanguage(value: string) {
    await setLocale(value);
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.appearance")}</CardTitle>
          <CardDescription>{t("settings.appearanceDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="settings-theme">{t("settings.theme")}</FieldLabel>
            <Select value={mounted ? (theme ?? "system") : null} onValueChange={(value) => value && setTheme(value)} items={THEMES.map((value) => ({ value, label: t(`header.${value}`) }))}>
              <SelectTrigger id="settings-theme" className="w-full sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(`header.${value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.language")}</CardTitle>
          <CardDescription>{t("settings.languageDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="settings-language">{t("settings.interfaceLanguage")}</FieldLabel>
            <Select value={locale} onValueChange={(value) => value && changeLanguage(value)} items={languages.map((l) => ({ value: l.code, label: l.nativeName }))}>
              <SelectTrigger id="settings-language" className="w-full sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    <Flag code={language.flagCode} />
                    {language.nativeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.tables")}</CardTitle>
          <CardDescription>{t("settings.tablesDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="settings-page-size">{t("settings.pageSize")}</FieldLabel>
            <Select value={String(preferences.tablePageSize)} onValueChange={(value) => value && setPreference("tablePageSize", Number(value))}>
              <SelectTrigger id="settings-page-size" className="w-full sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.notifications")}</CardTitle>
          <CardDescription>{t("settings.notificationsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="settings-toasts">{t("settings.toasts")}</FieldLabel>
              <FieldDescription>{t("settings.toastsDescription")}</FieldDescription>
            </FieldContent>
            <Switch id="settings-toasts" checked={preferences.notificationToasts} onCheckedChange={(checked) => setPreference("notificationToasts", checked)} />
          </Field>
        </CardContent>
      </Card>
    </div>
  );
}
