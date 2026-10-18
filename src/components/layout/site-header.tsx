import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { CommandPalette } from "./command-palette";
import { LanguageSwitcher } from "./language-switcher";
import { PageBreadcrumb } from "./page-breadcrumb";
import { ThemeToggle } from "./theme-toggle";
import type { PublicLanguage } from "@/lib/server/languages";

export function SiteHeader({ roles, languages }: { roles: string[]; languages: PublicLanguage[] }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mx-1 h-4" />
      <PageBreadcrumb />
      <div className="ml-auto flex items-center gap-1">
        <CommandPalette roles={roles} languages={languages} />
        <NotificationBell />
        <LanguageSwitcher languages={languages} />
        <ThemeToggle />
      </div>
    </header>
  );
}
