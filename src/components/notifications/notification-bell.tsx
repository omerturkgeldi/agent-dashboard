"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getNotifications, getUnreadCount } from "@/lib/api/notifications";
import type { Notification } from "@/lib/api/types";
import { NotificationItem } from "./notification-item";
import { useNotificationActions } from "./use-notification-actions";

// No push channel yet: the unread count is polled. Tokens are httpOnly, so the browser cannot open a socket to the API itself.
const POLL_MS = 30_000;

export function NotificationBell() {
  const t = useTranslations("notifications");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { markRead, markAllRead } = useNotificationActions();

  const { data: unread = 0 } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  });
  const { data: latest } = useQuery({
    queryKey: ["notifications", "latest"],
    queryFn: () => getNotifications(false, 1, 6),
    enabled: open,
  });

  function openNotification(notification: Notification) {
    if (!notification.isRead) markRead.mutate(notification.id);
    setOpen(false);
    if (notification.link) router.push(notification.link);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="ghost" size="icon" className="relative" aria-label={t("title")} />}>
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium leading-4 text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(24rem,calc(100vw-2rem))] gap-0 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-medium">{t("title")}</span>
          <Button variant="ghost" size="sm" disabled={unread === 0 || markAllRead.isPending} onClick={() => markAllRead.mutate()}>
            {t("markAllRead")}
          </Button>
        </div>
        <div className="max-h-96 overflow-y-auto p-1">
          {latest?.items.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">{t("empty")}</p>}
          {latest?.items.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} onClick={() => openNotification(notification)} />
          ))}
        </div>
        <div className="border-t p-1">
          <Button variant="ghost" size="sm" className="w-full" nativeButton={false} render={<Link href="/notifications" onClick={() => setOpen(false)} />}>
            {t("viewAll")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
