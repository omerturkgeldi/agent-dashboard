import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/server/current-user";
import { ChangePasswordForm } from "./change-password-form";
import { MySessions } from "./my-sessions";

export default async function ProfilePage() {
  const t = await getTranslations("profile");
  const ts = await getTranslations("sessions");
  const user = await getCurrentUser();
  if (!user) return null; // the dashboard layout has already redirected to /login

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{user.displayName}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {user.name} {user.surname}
            </p>
            <div className="space-x-1">
              {user.roles.map((role) => (
                <Badge key={role} variant="secondary">{role}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("changePassword")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{ts("title")}</CardTitle>
            <CardDescription>{ts("mineDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <MySessions />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
