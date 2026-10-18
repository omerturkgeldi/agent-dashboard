import { ApiError, api } from "./client";
import type { ImportResult, PagedResult, SyncResult, TranslationFilter, TranslationRow } from "./types";

export function getTranslations(filter: TranslationFilter, pageNumber: number, pageSize: number) {
  const params = new URLSearchParams({ pageNumber: String(pageNumber), pageSize: String(pageSize) });
  for (const [key, value] of Object.entries(filter)) if (value) params.set(key, value);
  return api<PagedResult<TranslationRow>>(`/translations?${params}`);
}

export const updateTranslation = (keyId: string, language: string, value: string) =>
  api<TranslationRow>(`/translations/${keyId}/${language}`, { method: "PUT", body: { value } });

/** Finds the texts that are new or changed in code (dashboard and backend) and creates them in every language. */
export async function scanCode() {
  const response = await fetch("/api/translations/scan", { method: "POST" });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(result?.errorMessage ?? [response.statusText], response.status);
  return result.data as SyncResult;
}

async function failure(response: Response) {
  if (response.status === 401) window.location.replace("/login");
  const result = await response.json().catch(() => null);
  return new ApiError(result?.errorMessage ?? [response.statusText], response.status);
}

/** Downloads the .xlsx of the given languages (all languages when empty). */
export async function exportTranslations(languages: string[], onlyMissing: boolean) {
  const params = new URLSearchParams();
  languages.forEach((language) => params.append("languages", language));
  if (onlyMissing) params.set("onlyMissing", "true");

  const response = await fetch(`/api/proxy/translations/export?${params}`);
  if (!response.ok) throw await failure(response);

  const name = /filename="?([^";]+)"?/.exec(response.headers.get("Content-Disposition") ?? "")?.[1] ?? "translations.xlsx";
  const url = URL.createObjectURL(await response.blob());
  const link = Object.assign(document.createElement("a"), { href: url, download: name });
  link.click();
  URL.revokeObjectURL(url);
}

/** Uploads a filled-in export. */
export async function importTranslations(file: File) {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch("/api/proxy/translations/import", { method: "POST", body: form });
  if (!response.ok) throw await failure(response);
  return (await response.json()).data as ImportResult;
}
