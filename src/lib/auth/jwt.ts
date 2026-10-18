// Reads claims from the access token for UI decisions only (menu, redirects).
// The token is NOT verified here, the backend verifies it on every request.

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export function getRolesFromToken(token: string | undefined): string[] {
  if (!token) return [];
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(payload));
    const roles = claims[ROLE_CLAIM] ?? claims.role ?? [];
    return Array.isArray(roles) ? roles : [roles];
  } catch {
    return [];
  }
}
