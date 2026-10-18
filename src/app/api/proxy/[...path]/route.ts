import type { NextRequest } from "next/server";
import { fetchAsUser, withSession } from "@/lib/server/session-fetch";

// Forwards browser API calls to the backend and adds the Bearer token from the cookie.
// Bodies and answers are passed on as they are, so JSON, file uploads (multipart) and file downloads all work.
async function forward(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = `/api/${path.join("/")}${request.nextUrl.search}`;
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer();
  const contentType = request.headers.get("content-type") ?? "application/json";

  const { response, newTokens } = await fetchAsUser(url, { method: request.method, headers: { "Content-Type": contentType }, body: body?.byteLength ? body : undefined });
  return withSession(response, newTokens);
}

export { forward as GET, forward as POST, forward as PUT, forward as DELETE };
