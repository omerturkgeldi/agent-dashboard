import { api } from "./client";
import type { Language, ManagedLanguage } from "./types";

export const getManagedLanguages = () => api<ManagedLanguage[]>("/languages/manage");

export const createLanguage = (body: { code: string; name: string; nativeName: string; flagCode?: string }) => api<Language>("/languages", { method: "POST", body });

export const updateLanguage = (code: string, body: { name: string; nativeName: string; flagCode?: string; isActive: boolean; sortOrder: number }) =>
  api(`/languages/${code}`, { method: "PUT", body });

export const deleteLanguage = (code: string) => api(`/languages/${code}`, { method: "DELETE" });
