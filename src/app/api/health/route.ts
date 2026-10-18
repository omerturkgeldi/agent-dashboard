import { NextResponse } from "next/server";
import { API_URL } from "@/lib/server/session";

/**
 * Is the dashboard's backend up, and does it reach its database? Answers 200 when both are, 503 otherwise.
 * Public on purpose (no session needed), like the backend's own /health: the dashboard's status pill and Docker call it.
 */
export async function GET() {
  // 503 from the backend means it runs but its database does not answer. No answer at all means the backend is down.
  const response = await fetch(`${API_URL}/health`, { cache: "no-store", signal: AbortSignal.timeout(3000) }).catch(() => null);
  const status = { api: response ? "up" : "down", database: response?.ok ? "up" : "down" };
  return NextResponse.json(status, { status: response?.ok ? 200 : 503 });
}
