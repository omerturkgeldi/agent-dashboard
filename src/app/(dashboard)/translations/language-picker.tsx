"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronsUpDown } from "lucide-react";
import { Flag } from "@/components/flag";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type CommonLanguage, commonLanguages } from "./common-languages";

/** Searchable list of common languages (by name, native name or code). Existing languages are left out. */
export function LanguagePicker({ existing, onPick }: { existing: string[]; onPick: (language: CommonLanguage) => void }) {
  const t = useTranslations("translations");
  const [open, setOpen] = useState(false);
  const available = commonLanguages.filter((l) => !existing.some((code) => code.toLowerCase() === l.code.toLowerCase()));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button type="button" variant="outline" className="w-full justify-between font-normal text-muted-foreground" />}>
        {t("chooseCommonPlaceholder", { count: available.length })}
        <ChevronsUpDown className="size-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-(--anchor-width) p-0" align="start">
        <Command>
          <CommandInput placeholder={t("searchLanguage")} />
          <CommandList>
            <CommandEmpty>{t("noLanguageFound")}</CommandEmpty>
            <CommandGroup>
              {available.map((language) => (
                <CommandItem
                  key={language.code}
                  value={`${language.nativeName} ${language.name} ${language.code}`}
                  onSelect={() => {
                    onPick(language);
                    setOpen(false);
                  }}
                >
                  <Flag code={language.flagCode} />
                  <span>{language.nativeName}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {language.name} · {language.code}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
