import "server-only";
import { API_URL } from "./session";

export interface PublicLanguage {
  code: string;
  name: string;
  nativeName: string;
  flagCode: string | null;
  isDefault: boolean;
}

// Used when the backend cannot be reached, so the login page and the language picker still work.
const fallback: PublicLanguage[] = [
  { code: "en", name: "English", nativeName: "English", flagCode: "gb", isDefault: true },
  { code: "de", name: "German", nativeName: "Deutsch", flagCode: "de", isDefault: false },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flagCode: "tr", isDefault: false },
];

/** The active languages from the backend, cached for a minute (and dropped right away when the dashboard changes them). */
export async function getLanguages(): Promise<PublicLanguage[]> {
  try {
    const response = await fetch(`${API_URL}/api/languages`, { next: { revalidate: 60, tags: ["languages"] } });
    if (!response.ok) return fallback;
    const languages = (await response.json()).data as PublicLanguage[];
    return languages.length > 0 ? languages : fallback;
  } catch {
    return fallback;
  }
}
