import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE, backendFetch, clearTokenCookies } from "@/lib/server/session";

export async function POST() {
  const store = await cookies();
  const accessToken = store.get(ACCESS_COOKIE)?.value;
  const refreshToken = store.get(REFRESH_COOKIE)?.value;

  // Best effort: end the session on the backend, but always sign the user out locally.
  if (accessToken) await backendFetch("/api/auth/logout", { method: "POST" }, accessToken).catch(() => null);
  if (refreshToken) {
    await backendFetch("/api/auth/revoke-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(refreshToken),
    }).catch(() => null);
  }

  const response = NextResponse.json({ data: null, errorMessage: null });
  clearTokenCookies(response);
  return response;
}
