"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Flag } from "@/components/flag";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { setLocale } from "@/i18n/actions";
import type { PublicLanguage } from "@/lib/server/languages";

export function LanguageSwitcher({ languages }: { languages: PublicLanguage[] }) {
  const t = useTranslations("header");
  const locale = useLocale();
  const router = useRouter();
  const current = languages.find((l) => l.code === locale);

  async function change(value: string) {
    await setLocale(value);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={t("language")} />}>
        <Flag code={current?.flagCode} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={locale} onValueChange={change}>
          {languages.map((language) => (
            <DropdownMenuRadioItem key={language.code} value={language.code}>
              <Flag code={language.flagCode} />
              {language.nativeName}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
