"use server";

import { cookies } from "next/headers";
import { updateTag } from "next/cache";
import { getLanguages } from "@/lib/server/languages";
import { LOCALE_COOKIE } from "./config";

export async function setLocale(locale: string) {
  if (!(await getLanguages()).some((l) => l.code === locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}

/**
 * Called after the dashboard changed translations or languages, so users see them right away instead of after the cache
 * expires. Give the language that changed, or nothing when many changed (a scan, an import, a new language).
 */
export async function refreshTranslations(language?: string) {
  updateTag("languages");
  const codes = language ? [language] : (await getLanguages()).map((l) => l.code);
  codes.forEach((code) => updateTag(`translations-${code}`));
}
