export interface SystemStatus {
  api: "up" | "down";
  database: "up" | "down";
}

/** The status route answers 503 when something is down, but the body is still the status, so it is read either way. */
export async function getSystemStatus(): Promise<SystemStatus> {
  const response = await fetch("/api/health");
  return response.json();
}
