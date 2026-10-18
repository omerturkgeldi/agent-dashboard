import "server-only";
import { API_URL } from "@/lib/server/session";
import { merge } from "@/lib/translations/flatten";
import en from "../../messages/en.json";

type Messages = typeof en;

// The database is the source of the texts. The bundled files are only a safety net when it cannot be reached:
// English is always the base, so a text that is missing anywhere shows in English instead of as a key.
async function fromBackend(locale: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(`${API_URL}/api/translations/bundle/${locale}?scope=ui`, { next: { revalidate: 60, tags: [`translations-${locale}`] } });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

async function fromFile(locale: string): Promise<Record<string, unknown>> {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch {
    return {};
  }
}

export async function loadMessages(locale: string): Promise<Messages> {
  return merge(en, (await fromBackend(locale)) ?? (await fromFile(locale)));
}
