import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getLanguages } from "@/lib/server/languages";
import { LoginForm } from "./login-form";
import { appName } from "@/lib/config/app";

export default async function LoginPage() {
  const t = await getTranslations("login");
  const languages = await getLanguages();

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher languages={languages} />
      </div>
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-semibold tracking-tight">{appName}</h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">{t("subtitle")}</p>
        <LoginForm />
      </div>
    </div>
  );
}
