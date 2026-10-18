"use client";

import "./globals.css";
import { fontVariables } from "./fonts";
import { useEffect, useSyncExternalStore } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/status-page";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { LOCALE_COOKIE, defaultLocale } from "@/i18n/config";
import en from "../../messages/en.json";
import de from "../../messages/de.json";
import tr from "../../messages/tr.json";

// Replaces the root layout, so there is no next-intl provider and the backend cannot be asked for texts:
// the bundled files are used, picked by the language cookie.
const texts: Record<string, typeof en.errors> = { en: en.errors, de: de.errors, tr: tr.errors };

function cookieLocale() {
  const cookie = document.cookie.split("; ").find((c) => c.startsWith(`${LOCALE_COOKIE}=`))?.split("=")[1];
  return cookie && cookie in texts ? cookie : defaultLocale;
}

const subscribe = () => () => {};

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  // The server cannot see the cookie here: it renders English, the browser switches after hydration.
  const locale = useSyncExternalStore(subscribe, cookieLocale, () => defaultLocale);
  const t = texts[locale];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang={locale} suppressHydrationWarning className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <title>{t.errorTitle}</title>
        <ThemeProvider>
          <StatusPage icon={TriangleAlert} title={t.errorTitle} description={t.errorDescription}>
            <Button onClick={() => retry()}>{t.retry}</Button>
            {error.digest && <p className="font-mono text-xs text-muted-foreground">{t.reference.replace("{digest}", error.digest)}</p>}
          </StatusPage>
        </ThemeProvider>
      </body>
    </html>
  );
}
