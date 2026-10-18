import { ApiError, api } from "./client";
import type { Session } from "./types";

export async function login(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new ApiError(result?.errorMessage ?? [response.statusText], response.status);
  }
}

export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
}

export const changePassword = (currentPassword: string, newPassword: string) =>
  api("/auth/change-password", { method: "POST", body: { passDto: { currentPassword, newPassword } } });

export const getMySessions = () => api<Session[]>("/auth/sessions");

export const endMySession = (id: string) => api(`/auth/sessions/${id}`, { method: "DELETE" });

export const endMyOtherSessions = () => api("/auth/sessions", { method: "DELETE" });
