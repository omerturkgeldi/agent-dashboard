import { api } from "./client";
import type { CreateUserRequest, Session, UpdateUserRequest, User } from "./types";

export const getUsers = () => api<User[]>("/users");

export const createUser = (body: CreateUserRequest) => api<User>("/users", { method: "POST", body });

export const updateUser = (id: string, body: UpdateUserRequest) => api(`/users/${id}`, { method: "PUT", body });

export const deleteUser = (id: string) => api(`/users/${id}`, { method: "DELETE" });

export const updateUserRoles = (id: string, roles: string[]) => api(`/users/${id}/roles`, { method: "PUT", body: { roles } });

export const setUserActive = (id: string, isActive: boolean) => api(`/users/${id}/${isActive ? "activate" : "deactivate"}`, { method: "POST" });

export const resetUserPassword = (id: string, newPassword: string) => api(`/users/${id}/reset-password`, { method: "POST", body: { newPassword } });

export const getUserSessions = (id: string) => api<Session[]>(`/users/${id}/sessions`);

export const endUserSession = (id: string, sessionId: string) => api(`/users/${id}/sessions/${sessionId}`, { method: "DELETE" });

export const endAllUserSessions = (id: string) => api(`/users/${id}/sessions`, { method: "DELETE" });
