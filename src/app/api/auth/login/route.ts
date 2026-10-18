import { NextResponse } from "next/server";
import type { TokenDto } from "@/lib/api/types";
import { backendFetch, setTokenCookies } from "@/lib/server/session";

const forwarded = ["x-forwarded-for", "user-agent", "cf-ipcountry", "cloudfront-viewer-country", "x-country-code"];

function forwardedHeaders(request: Request) {
  return Object.fromEntries(forwarded.flatMap((name) => {
    const value = request.headers.get(name);
    return value ? [[name, value]] : [];
  }));
}

export async function POST(request: Request) {
  const response = await backendFetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // The backend sees this server, not the browser. Pass on who is really signing in (device list, country map).
      ...forwardedHeaders(request),
    },
    body: await request.text(),
  });
  const result = await response.json().catch(() => null);

  // Tokens stay in httpOnly cookies, the browser only gets the result without them.
  if (!response.ok) return NextResponse.json(result, { status: response.status });

  const next = NextResponse.json({ data: null, errorMessage: null });
  setTokenCookies(next, result.data as TokenDto);
  return next;
}
