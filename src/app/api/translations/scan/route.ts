import { NextResponse } from "next/server";
import type { SyncResult } from "@/lib/api/types";
import { flatten } from "@/lib/translations/flatten";
import { setTokenCookies } from "@/lib/server/session";
import { fetchAsUser, withSession } from "@/lib/server/session-fetch";
import de from "../../../../../messages/de.json";
import en from "../../../../../messages/en.json";
import tr from "../../../../../messages/tr.json";

const json = { "Content-Type": "application/json" };

// "Find new texts": brings both kinds of texts up to date.
// 1. The dashboard's texts as written in code (messages/en.json) are sent to the backend. de.json and tr.json are only
//    shipped starting translations: they fill translations that are still empty.
// 2. The backend is told to look at its own texts (error and validation messages) now, instead of waiting for its hourly scan.
export async function POST() {
  const body = JSON.stringify({ scope: "ui", keys: flatten(en), translations: { de: flatten(de), tr: flatten(tr) } });
  const ui = await fetchAsUser("/api/translations/sync", { method: "POST", headers: json, body });
  if (!ui.response.ok) return withSession(ui.response, ui.newTokens);

  const api = await fetchAsUser("/api/translations/scan", { method: "POST", headers: json });
  const tokens = api.newTokens ?? ui.newTokens;
  if (!api.response.ok) return withSession(api.response, tokens);

  const [uiResult, apiResult] = [(await ui.response.json()).data as SyncResult, (await api.response.json()).data as SyncResult];
  const total = {
    scope: "all",
    total: uiResult.total + apiResult.total,
    added: uiResult.added + apiResult.added,
    sourceChanged: uiResult.sourceChanged + apiResult.sourceChanged,
    markedUnused: uiResult.markedUnused + apiResult.markedUnused,
    pending: uiResult.pending + apiResult.pending,
  };

  const response = NextResponse.json({ data: total, errorMessage: null });
  if (tokens) setTokenCookies(response, tokens);
  return response;
}
