import { api } from "./client";
import type { Log, LogFilter, PagedResult } from "./types";

export function getLogs(filter: LogFilter, pageNumber: number, pageSize: number) {
  const params = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) });
  for (const [key, value] of Object.entries(filter)) if (value) params.set(key, value);
  return api<PagedResult<Log>>(`/logs/filter?${params}`);
}
