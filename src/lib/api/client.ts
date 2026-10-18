import type { ServiceResult } from "./types";

export class ApiError extends Error {
  constructor(
    public messages: string[],
    public status: number,
  ) {
    super(messages.join(", "));
  }
}

/**
 * Typed call to the backend through the Next.js proxy (/api/proxy).
 * Unwraps `ServiceResult`: returns `data` on success, throws `ApiError` with the
 * (already translated) backend messages otherwise.
 */
export async function api<T = null>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(`/api/proxy${path}`, {
    method: options.method ?? "GET",
    headers: { "Content-Type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 401 && typeof window !== "undefined") {
    window.location.replace("/login");
  }

  const result: ServiceResult<T> | null = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(result?.errorMessage ?? [response.statusText], response.status);
  }
  return (result?.data ?? null) as T;
}
