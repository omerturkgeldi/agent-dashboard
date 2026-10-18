"use client";

import { useLocale, useTranslations } from "next-intl";
import { Laptop, Smartphone } from "lucide-react";
import { Flag } from "@/components/flag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Session } from "@/lib/api/types";
import { countryName, describeUserAgent } from "@/lib/user-agent";

function timeAgo(date: string, locale: string, justNow: string) {
  const seconds = Math.round((new Date(date).getTime() - Date.now()) / 1000);
  if (Math.abs(seconds) < 60) return justNow;
  const format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (Math.abs(seconds) < 3600) return format.format(Math.round(seconds / 60), "minute");
  if (Math.abs(seconds) < 86400) return format.format(Math.round(seconds / 3600), "hour");
  return format.format(Math.round(seconds / 86400), "day");
}

/** Open sessions (devices) of a user, each with an "end session" button. Used on the profile and in the users table. */
export function SessionList({
  sessions,
  isLoading,
  onEnd,
  disabled,
}: {
  sessions?: Session[];
  isLoading?: boolean;
  onEnd: (session: Session) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("sessions");
  const locale = useLocale();

  if (isLoading) return <Skeleton className="h-16 w-full" />;
  if (!sessions?.length) return <p className="text-sm text-muted-foreground">{t("empty")}</p>;

  return (
    <ul className="divide-y">
      {sessions.map((session) => {
        const { browser, os, mobile } = describeUserAgent(session.userAgent);
        const Icon = mobile ? Smartphone : Laptop;
        return (
          <li key={session.id} className="flex items-center gap-3 py-3">
            <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                {[browser, os].filter(Boolean).join(" · ") || t("unknownDevice")}
                {session.isCurrent && <Badge variant="secondary">{t("thisDevice")}</Badge>}
              </p>
              <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Flag code={session.countryCode} className="size-3.5" />
                  {session.countryCode ? countryName(session.countryCode, locale) : t("unknownCountry")}
                </span>
                {session.ipAddress && <span>{session.ipAddress}</span>}
                <span>{t("lastActive", { time: timeAgo(session.lastActivity, locale, t("justNow")) })}</span>
              </p>
            </div>
            {!session.isCurrent && (
              <Button variant="outline" size="sm" disabled={disabled} onClick={() => onEnd(session)}>
                {t("end")}
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
