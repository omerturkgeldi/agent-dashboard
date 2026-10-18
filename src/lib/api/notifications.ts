import { api } from "./client";
import type { Notification, PagedResult } from "./types";

export const getNotifications = (unreadOnly: boolean, pageNumber: number, pageSize: number) =>
  api<PagedResult<Notification>>(`/notifications?unreadOnly=${unreadOnly}&pageNumber=${pageNumber}&pageSize=${pageSize}`);

export const getUnreadCount = () => api<number>("/notifications/unread-count");

export const markAsRead = (id: string) => api(`/notifications/${id}/read`, { method: "POST" });

export const markAllAsRead = () => api("/notifications/read-all", { method: "POST" });

export const deleteNotification = (id: string) => api(`/notifications/${id}`, { method: "DELETE" });
