import { api } from "./client";
import type { AuditFilter, AuditLog, PagedResult } from "./types";

export function getAuditLogs(filter: AuditFilter, pageNumber: number, pageSize: number) {
  const params = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) });
  for (const [key, value] of Object.entries(filter)) if (value) params.set(key, value);
  return api<PagedResult<AuditLog>>(`/audit?${params}`);
}
