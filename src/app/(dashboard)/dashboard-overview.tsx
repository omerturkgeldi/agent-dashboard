"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Languages, ShieldCheck, TriangleAlert, Users, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDashboardSummary } from "@/lib/api/dashboard";
import { getLogs } from "@/lib/api/logs";
import { getUsers } from "@/lib/api/users";
import { DashboardCharts } from "./dashboard-charts";
import { SystemStatus } from "./system-status";
import { OnlineUsersCard } from "./online-users-card";

const levelVariant = { Error: "destructive", Warning: "secondary", Info: "outline" } as const;

function StatCard({ title, value, icon: Icon, href }: { title: string; value?: number | null; icon: LucideIcon; href?: string }) {
  const card = (
    <Card className="h-full bg-linear-to-t from-primary/5 to-card shadow-xs">
      <CardHeader className="flex! items-center justify-between">
        <div className="space-y-1">
          <CardDescription>{title}</CardDescription>
          <CardTitle className="text-3xl">{value ?? <Skeleton className="h-9 w-16" />}</CardTitle>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </CardHeader>
    </Card>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

export function DashboardOverview({ canSeeUsers, canSeeLogs, canSeeTranslations }: { canSeeUsers: boolean; canSeeLogs: boolean; canSeeTranslations: boolean }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const summary = useQuery({ queryKey: ["dashboard", "summary"], queryFn: getDashboardSummary, refetchInterval: 60_000 });
  const users = useQuery({ queryKey: ["users"], queryFn: getUsers, enabled: canSeeUsers });
  const recentLogs = useQuery({ queryKey: ["logs", "recent"], queryFn: () => getLogs({}, 1, 5), enabled: canSeeLogs });
  const data = summary.data;

  return (
    <>
      {canSeeLogs && <SystemStatus />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {canSeeUsers && <StatCard title={t("users")} icon={Users} value={data?.users} />}
        {canSeeUsers && <StatCard title={t("roles")} icon={ShieldCheck} value={data?.roles} />}
        {canSeeLogs && <StatCard title={t("errors24h")} icon={TriangleAlert} value={data?.errors24h} href="/logs" />}
        {canSeeTranslations && (
          <StatCard title={t("pendingTranslations")} icon={Languages} value={data?.pendingTranslations} href="/translations?status=Untranslated" />
        )}
      </div>

      {data?.onlineByCountry && <OnlineUsersCard summary={data} />}

      <DashboardCharts summary={data} />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {canSeeUsers && (
          <Card>
            <CardHeader>
              <CardTitle>{t("users")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("email")}</TableHead>
                    <TableHead>{t("roles")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.data?.slice(0, 5).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.displayName}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell className="space-x-1">
                        {user.roles.map((role) => (
                          <Badge key={role} variant="secondary">{role}</Badge>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {canSeeLogs && (
          <Card>
            <CardHeader>
              <CardTitle>{t("recentLogs")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("level")}</TableHead>
                    <TableHead>{t("message")}</TableHead>
                    <TableHead>{t("time")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLogs.data?.items.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant={levelVariant[log.level as keyof typeof levelVariant] ?? "outline"}>{log.level}</Badge>
                      </TableCell>
                      <TableCell className="max-w-64 truncate">{log.message}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{new Date(log.createdAt).toLocaleTimeString(locale)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
