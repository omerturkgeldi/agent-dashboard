import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { getLanguages } from "@/lib/server/languages";
import { LOCALE_COOKIE, defaultLocale } from "./config";
import { loadMessages } from "./messages";

// The language lives in a cookie (no /en, /de prefix). The same cookie is sent to the backend as Accept-Language.
// The languages and their texts come from the backend, so a language added in the dashboard works without a deploy.
export default getRequestConfig(async () => {
  const cookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  const languages = await getLanguages();
  const locale = languages.some((l) => l.code === cookie) ? cookie! : defaultLocale;
  return { locale, messages: await loadMessages(locale) };
});
