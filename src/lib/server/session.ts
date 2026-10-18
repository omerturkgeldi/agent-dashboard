import "server-only";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { LOCALE_COOKIE, defaultLocale } from "@/i18n/config";
import type { TokenDto } from "@/lib/api/types";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

export const API_URL = process.env.API_URL ?? "http://localhost:5076";

const cookieOptions = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" } as const;

function secondsUntil(date: string) {
  return Math.max(0, Math.floor((new Date(date).getTime() - Date.now()) / 1000));
}

export function setTokenCookies(response: NextResponse, token: TokenDto) {
  response.cookies.set(ACCESS_COOKIE, token.accessToken, { ...cookieOptions, maxAge: secondsUntil(token.accessTokenExpiration) });
  response.cookies.set(REFRESH_COOKIE, token.refreshToken, { ...cookieOptions, maxAge: secondsUntil(token.refreshTokenExpiration) });
}

export function clearTokenCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
}

/**
 * Calls the backend with the language the user picked. Pass a token to send it as Bearer.
 * `locale` is only needed where cookies() is unavailable (proxy.ts).
 */
export async function backendFetch(path: string, init: RequestInit = {}, accessToken?: string, locale?: string) {
  const headers = new Headers(init.headers);
  headers.set("Accept-Language", locale ?? (await cookies()).get(LOCALE_COOKIE)?.value ?? defaultLocale);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  return fetch(`${API_URL}${path}`, { ...init, headers, cache: "no-store" });
}

/** Exchanges a refresh token for a new token pair. Returns null when it is no longer valid. */
export async function refreshTokens(refreshToken: string, locale?: string): Promise<TokenDto | null> {
  const response = await backendFetch(
    "/api/auth/refresh-token",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(refreshToken) },
    undefined,
    locale,
  );
  if (!response.ok) return null;
  return (await response.json()).data as TokenDto;
}
