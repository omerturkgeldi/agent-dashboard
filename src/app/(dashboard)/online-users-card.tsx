"use client";

import { useLocale, useTranslations } from "next-intl";
import { Flag } from "@/components/flag";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorldMap } from "@/components/world-map/world-map";
import type { DashboardSummary } from "@/lib/api/types";
import { countryName } from "@/lib/user-agent";

const TOP_COUNTRIES = 10;

/** Where the users who are online right now come from: a map, and the busiest countries next to it. */
export function OnlineUsersCard({ summary }: { summary: DashboardSummary }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const countries = summary.onlineByCountry ?? [];
  const known = countries.filter((c) => c.countryCode);
  const unknown = countries.find((c) => !c.countryCode)?.users ?? 0;
  const max = Math.max(1, ...known.map((c) => c.users));
  const values = Object.fromEntries(known.map((c) => [c.countryCode!, c.users]));

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{t("onlineUsers")}</CardTitle>
        <CardDescription>{t("onlineDescription", { count: summary.onlineUsers ?? 0 })}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WorldMap values={values} locale={locale} unit={(count) => t("usersCount", { count })} />
        </div>
        <div className="space-y-3">
          {known.length === 0 && <p className="text-sm text-muted-foreground">{t("noOnline")}</p>}
          {known.slice(0, TOP_COUNTRIES).map((c) => (
            <div key={c.countryCode} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <Flag code={c.countryCode} />
                  {countryName(c.countryCode!, locale)}
                </span>
                <span className="font-medium tabular-nums">{c.users}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(c.users / max) * 100}%` }} />
              </div>
            </div>
          ))}
          {unknown > 0 && (
            <p className="text-xs text-muted-foreground">{t("unknownCountry", { count: unknown })}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
