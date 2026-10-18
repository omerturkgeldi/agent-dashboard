"use client";

import { useLocale, useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { DashboardSummary } from "@/lib/api/types";

export function DashboardCharts({ summary }: { summary?: DashboardSummary }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const day = (date: string) => new Date(date).toLocaleDateString(locale, { day: "numeric", month: "short" });

  const activityConfig = { count: { label: t("actions"), color: "var(--primary)" } } satisfies ChartConfig;
  const logsConfig = {
    errors: { label: t("errors"), color: "var(--destructive)" },
    warnings: { label: t("warnings"), color: "var(--chart-2)" },
  } satisfies ChartConfig;

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      {summary?.activityPerDay && (
        <Card>
          <CardHeader>
            <CardTitle>{t("activity")}</CardTitle>
            <CardDescription>{t("last14Days")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={activityConfig} className="h-56 w-full">
              <BarChart data={summary.activityPerDay}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickFormatter={day} tickLine={false} axisLine={false} minTickGap={16} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent labelFormatter={(label) => day(String(label))} />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {summary?.logsPerDay && (
        <Card>
          <CardHeader>
            <CardTitle>{t("logsChart")}</CardTitle>
            <CardDescription>{t("last14Days")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={logsConfig} className="h-56 w-full">
              <BarChart data={summary.logsPerDay}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickFormatter={day} tickLine={false} axisLine={false} minTickGap={16} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
                <ChartTooltip content={<ChartTooltipContent labelFormatter={(label) => day(String(label))} />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="errors" stackId="logs" fill="var(--color-errors)" />
                <Bar dataKey="warnings" stackId="logs" fill="var(--color-warnings)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
