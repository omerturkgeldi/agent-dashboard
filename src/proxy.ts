import { NextResponse, type NextRequest } from "next/server";
import { getRolesFromToken } from "@/lib/auth/jwt";
import { LOCALE_COOKIE, defaultLocale } from "@/i18n/config";
import { canAccess, findPage } from "@/lib/config/nav";
import { ACCESS_COOKIE, REFRESH_COOKIE, clearTokenCookies, refreshTokens, setTokenCookies } from "@/lib/server/session";

// Optimistic checks only: redirects users to /login and away from pages their role cannot see.
// The backend is what actually enforces access.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/login";
  let accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  // The access token cookie expires with the token: renew it before the page renders.
  let newTokens = null;
  if (!accessToken && refreshToken) {
    newTokens = await refreshTokens(refreshToken, request.cookies.get(LOCALE_COOKIE)?.value ?? defaultLocale);
    accessToken = newTokens?.accessToken;
  }

  if (!accessToken) {
    if (isLoginPage) return NextResponse.next();
    const response = NextResponse.redirect(new URL("/login", request.url));
    if (refreshToken) clearTokenCookies(response);
    return response;
  }

  if (isLoginPage) return NextResponse.redirect(new URL("/", request.url));

  const roles = getRolesFromToken(accessToken);
  const page = findPage(pathname);
  if (page && !canAccess(page, roles)) return NextResponse.redirect(new URL("/", request.url));

  // Pass the new token on to the page being rendered, and store it in the browser.
  const requestHeaders = new Headers(request.headers);
  if (newTokens) {
    requestHeaders.set("cookie", `${request.headers.get("cookie") ?? ""}; ${ACCESS_COOKIE}=${newTokens.accessToken}`);
  }
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (newTokens) setTokenCookies(response, newTokens);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
