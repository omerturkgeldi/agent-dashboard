"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Check, Trash2 } from "lucide-react";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/data-state";
import { NotificationItem } from "@/components/notifications/notification-item";
import { useNotificationActions } from "@/components/notifications/use-notification-actions";
import { Pagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getNotifications } from "@/lib/api/notifications";
import type { Notification } from "@/lib/api/types";

const PAGE_SIZE = 20;

export function NotificationsList() {
  const t = useTranslations("notifications");
  const router = useRouter();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const { markRead, markAllRead, remove } = useNotificationActions();

  const { data, isPending, error } = useQuery({
    queryKey: ["notifications", "list", unreadOnly, page],
    queryFn: () => getNotifications(unreadOnly, page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  function open(notification: Notification) {
    if (!notification.isRead) markRead.mutate(notification.id);
    if (notification.link) router.push(notification.link);
  }

  function filter(value: boolean) {
    setUnreadOnly(value);
    setPage(1);
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1">
            <Button size="sm" variant={unreadOnly ? "ghost" : "secondary"} onClick={() => filter(false)}>
              {t("all")}
            </Button>
            <Button size="sm" variant={unreadOnly ? "secondary" : "ghost"} onClick={() => filter(true)}>
              {t("unread")}
            </Button>
          </div>
          <Button variant="outline" size="sm" disabled={markAllRead.isPending} onClick={() => markAllRead.mutate()}>
            <Check /> {t("markAllRead")}
          </Button>
        </div>

        {isPending && <TableSkeleton />}
        {error && <ErrorState message={error.message} />}
        {data && data.items.length === 0 && <EmptyState message={t("empty")} />}
        {data && data.items.length > 0 && (
          <div className="divide-y">
            {data.items.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} onClick={() => open(notification)}>
                <div className="flex shrink-0">
                  {!notification.isRead && (
                    <Button variant="ghost" size="icon" aria-label={t("markRead")} onClick={() => markRead.mutate(notification.id)}>
                      <Check />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" aria-label={t("delete")} onClick={() => remove.mutate(notification.id)}>
                    <Trash2 />
                  </Button>
                </div>
              </NotificationItem>
            ))}
          </div>
        )}

        {data && <Pagination page={page} pageSize={PAGE_SIZE} total={data.totalCount} summary={t("total", { count: data.totalCount })} onPageChange={setPage} />}
      </CardContent>
    </Card>
  );
}
