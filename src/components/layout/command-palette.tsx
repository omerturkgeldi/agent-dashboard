"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Monitor, Moon, Search, Sun } from "lucide-react";
import { Flag } from "@/components/flag";
import { Button } from "@/components/ui/button";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "@/components/ui/command";
import { setLocale } from "@/i18n/actions";
import { canAccess, navPages, quickAction } from "@/lib/config/nav";
import type { PublicLanguage } from "@/lib/server/languages";

/** Ctrl/Cmd + K: jump to a page or run a common action. Only offers what the user's roles allow. */
export function CommandPalette({ roles, languages }: { roles: string[]; languages: PublicLanguage[] }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const action = quickAction && canAccess(quickAction, roles) ? quickAction : null;

  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <>
      <Button variant="outline" size="sm" className="h-8 gap-2 text-muted-foreground sm:w-48 sm:justify-start" onClick={() => setOpen(true)} aria-label={t("palette.open")}>
        <Search />
        <span className="hidden sm:inline">{t("palette.open")}</span>
        <kbd className="pointer-events-none ml-auto hidden rounded border bg-muted px-1.5 font-mono text-[10px] sm:inline">⌘K</kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title={t("palette.open")} description={t("palette.placeholder")}>
        <Command>
          <CommandInput placeholder={t("palette.placeholder")} />
          <CommandList>
            <CommandEmpty>{t("palette.empty")}</CommandEmpty>
            <CommandGroup heading={t("palette.pages")}>
              {navPages
                .filter((page) => canAccess(page, roles))
                .map((page) => (
                  <CommandItem key={page.href} value={`${t(`nav.${page.label}`)} ${page.href}`} onSelect={run(() => router.push(page.href))}>
                    <page.icon /> {t(`nav.${page.label}`)}
                  </CommandItem>
                ))}
            </CommandGroup>
            {action && (
              <CommandGroup heading={t("palette.actions")}>
                <CommandItem value={t(`nav.${action.label}`)} onSelect={run(() => router.push(action.href))}>
                  <action.icon /> {t(`nav.${action.label}`)}
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup heading={t("palette.theme")}>
              <CommandItem value={t("header.light")} onSelect={run(() => setTheme("light"))}>
                <Sun /> {t("header.light")}
              </CommandItem>
              <CommandItem value={t("header.dark")} onSelect={run(() => setTheme("dark"))}>
                <Moon /> {t("header.dark")}
              </CommandItem>
              <CommandItem value={t("header.system")} onSelect={run(() => setTheme("system"))}>
                <Monitor /> {t("header.system")}
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading={t("palette.language")}>
              {languages.map((language) => (
                <CommandItem
                  key={language.code}
                  value={`${language.nativeName} ${language.name} ${t("palette.language")}`}
                  onSelect={run(async () => {
                    await setLocale(language.code);
                    router.refresh();
                  })}
                >
                  <Flag code={language.flagCode} /> {language.nativeName}
                  {language.code === locale && <CommandShortcut>✓</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
