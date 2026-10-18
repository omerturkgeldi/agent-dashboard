"use client";

import { useLocale, useTranslations } from "next-intl";
import { Bell, KeyRound, Languages, ShieldCheck, UserPlus, type LucideIcon } from "lucide-react";
import type { Notification } from "@/lib/api/types";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  UserCreated: UserPlus,
  RolesChanged: ShieldCheck,
  PasswordChanged: KeyRound,
  TranslationsPending: Languages,
  LanguageAdded: Languages,
};

/** One notification. The text comes from the messages files, keyed by the notification type. */
export function NotificationItem({ notification, onClick, children }: { notification: Notification; onClick?: () => void; children?: React.ReactNode }) {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const known = t.has(`types.${notification.type}.title`);
  const Icon = icons[notification.type] ?? Bell;

  return (
    <div className={cn("flex items-start gap-3 rounded-lg p-3", !notification.isRead && "bg-primary/5")}>
      <button type="button" onClick={onClick} className="flex min-w-0 flex-1 items-start gap-3 text-left">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("text-sm", !notification.isRead && "font-medium")}>{known ? t(`types.${notification.type}.title`) : t("unknown")}</p>
          {known && <p className="text-sm text-muted-foreground">{t(`types.${notification.type}.body`, notification.data as Record<string, string>)}</p>}
          <p className="mt-1 text-xs text-muted-foreground">{formatRelative(notification.createdAt, locale)}</p>
        </div>
        {!notification.isRead && <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-hidden />}
      </button>
      {children}
    </div>
  );
}
