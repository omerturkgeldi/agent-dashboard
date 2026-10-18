"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteNotification, markAllAsRead, markAsRead } from "@/lib/api/notifications";

/** Mutations shared by the bell and the notifications page. All of them refresh every notification query. */
export function useNotificationActions() {
  const queryClient = useQueryClient();
  const options = {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    onError: (error: Error) => toast.error(error.message),
  };

  return {
    markRead: useMutation({ mutationFn: markAsRead, ...options }),
    markAllRead: useMutation({ mutationFn: markAllAsRead, ...options }),
    remove: useMutation({ mutationFn: deleteNotification, ...options }),
  };
}
