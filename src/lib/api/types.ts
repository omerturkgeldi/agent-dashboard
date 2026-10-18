// Mirrors the backend DTOs (System.Text.Json camelCase).

export const ROLES = {
  SuperAdmin: "SuperAdmin",
  Admin: "Admin",
  Tech: "Tech",
  Employee: "Employee",
  Translator: "Translator",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export interface User {
  id: string;
  name: string;
  surname: string;
  displayName: string;
  email: string;
  isActive: boolean;
  roles: string[];
}

export interface Session {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  countryCode: string | null;
  loginTime: string;
  lastActivity: string;
  isCurrent: boolean;
}

export interface Role {
  id: string;
  name: string;
}

export interface Log {
  id: string;
  level: string;
  message: string;
  exception: string | null;
  source: string | null;
  userId: string | null;
  path: string | null;
  createdAt: string;
}

export interface TokenDto {
  accessToken: string;
  accessTokenExpiration: string;
  refreshToken: string;
  refreshTokenExpiration: string;
  roles: { name: string }[];
}

/** Every backend response has this shape. */
export interface ServiceResult<T = null> {
  data: T | null;
  errorMessage: string[] | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface CreateUserRequest {
  userName: string;
  email: string;
  password: string;
  name: string;
  surname: string;
  displayName?: string;
}

export interface UpdateUserRequest {
  email: string;
  name: string;
  surname: string;
  displayName?: string;
  isDeleted: boolean;
}

export interface LogFilter {
  level?: string;
  userId?: string;
  path?: string;
  from?: string;
  to?: string;
}

export interface AuditChange {
  field: string;
  old: string | null;
  new: string | null;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  entityName: string | null;
  entityId: string | null;
  changes: AuditChange[];
  ipAddress: string | null;
  createdAt: string;
}

export interface AuditFilter {
  userId?: string;
  action?: string;
  entityName?: string;
  from?: string;
  to?: string;
}

export interface Notification {
  id: string;
  /** Key of the message, see messages "notifications.types". */
  type: string;
  data: Record<string, string | null>;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flagCode: string | null;
  isActive: boolean;
  isDefault: boolean;
  isSystem: boolean;
  sortOrder: number;
}

/** A language with how much of it is translated. */
export interface ManagedLanguage extends Language {
  total: number;
  translated: number;
  needsReview: number;
  untranslated: number;
}

export type TranslationStatus = "Untranslated" | "Translated" | "NeedsReview";

export interface TranslationRow {
  keyId: string;
  languageCode: string;
  scope: string;
  key: string;
  sourceText: string;
  value: string | null;
  status: TranslationStatus;
  isUsed: boolean;
  updatedAt: string;
  updatedBy: string | null;
}

export interface TranslationFilter {
  language: string;
  scope?: string;
  status?: string;
  search?: string;
}

export interface ImportResult {
  languages: { language: string; updated: number; unchanged: number; errors: { scope: string; key: string; reason: string }[] }[];
  ignoredColumns: string[];
}

export interface SyncResult {
  scope: string;
  total: number;
  added: number;
  sourceChanged: number;
  markedUnused: number;
  pending: number;
}

export interface DashboardSummary {
  users: number | null;
  roles: number | null;
  onlineUsers: number | null;
  onlineByCountry: { countryCode: string | null; users: number }[] | null;
  activityPerDay: { date: string; count: number }[] | null;
  errors24h: number | null;
  logsPerDay: { date: string; errors: number; warnings: number }[] | null;
  pendingTranslations: number | null;
}
