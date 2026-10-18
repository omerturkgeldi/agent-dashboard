import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { TokenDto } from "@/lib/api/types";
import { ACCESS_COOKIE, REFRESH_COOKIE, backendFetch, clearTokenCookies, refreshTokens, setTokenCookies } from "./session";

/**
 * Calls the backend as the signed-in user. On a 401 it refreshes the token once and retries.
 * `newTokens` is set when that happened: put them on the response with `withSession`.
 */
export async function fetchAsUser(path: string, init: RequestInit) {
  const store = await cookies();
  let accessToken = store.get(ACCESS_COOKIE)?.value;
  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  let newTokens: TokenDto | null = null;

  let response = await backendFetch(path, init, accessToken);
  if (response.status === 401 && refreshToken) {
    newTokens = await refreshTokens(refreshToken);
    if (newTokens) {
      accessToken = newTokens.accessToken;
      response = await backendFetch(path, init, accessToken);
    }
  }

  return { response, newTokens };
}

/** Turns the backend's answer into ours: keeps status and body, stores refreshed tokens, or signs out on a 401. */
export async function withSession(response: Response, newTokens: TokenDto | null) {
  const headers: Record<string, string> = { "Content-Type": response.headers.get("Content-Type") ?? "application/json" };
  const disposition = response.headers.get("Content-Disposition"); // file downloads
  if (disposition) headers["Content-Disposition"] = disposition;

  const result = new NextResponse(response.status === 204 ? null : await response.arrayBuffer(), { status: response.status, headers });
  if (newTokens) setTokenCookies(result, newTokens);
  else if (response.status === 401) clearTokenCookies(result);
  return result;
}
