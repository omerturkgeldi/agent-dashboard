import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import type { ServiceResult, User } from "@/lib/api/types";
import { ACCESS_COOKIE, backendFetch } from "./session";

/** The signed-in user, or null. proxy.ts has already refreshed an expired access token. Cached per request. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!accessToken) return null;

  const response = await backendFetch("/api/users/me", {}, accessToken);
  if (!response.ok) return null;
  return ((await response.json()) as ServiceResult<User>).data;
});
