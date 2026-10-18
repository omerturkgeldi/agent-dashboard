import { NextResponse, type NextRequest } from "next/server";
import { clearTokenCookies } from "@/lib/server/session";

/**
 * Where the dashboard sends a browser whose token the backend no longer accepts (session ended, database reset, or a
 * cookie of another app on the same host: cookies are shared across localhost ports). Without clearing the cookies,
 * proxy.ts would send /login back to / and the browser would loop.
 */
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  clearTokenCookies(response);
  return response;
}
