import { ROLES, type User } from "@/lib/api/types";

const adminRoles: string[] = [ROLES.SuperAdmin, ROLES.Admin];

/**
 * Who may manage whom. Mirrors the backend's UserAccessPolicy, which is what actually enforces it;
 * this only decides what the UI offers.
 * - nobody manages themselves (profile page: change password, sign out)
 * - a SuperAdmin manages everybody else
 * - an Admin manages only users who are not Admin or SuperAdmin
 */
export function canManageUser(actor: Pick<User, "id" | "roles">, target: User) {
  if (actor.id === target.id) return false;
  if (actor.roles.includes(ROLES.SuperAdmin)) return true;
  return !target.roles.some((role) => adminRoles.includes(role));
}

/** The roles the actor may give. Admins cannot hand out Admin or SuperAdmin. */
export function grantableRoles(actor: Pick<User, "roles">, roles: string[]) {
  return actor.roles.includes(ROLES.SuperAdmin) ? roles : roles.filter((role) => !adminRoles.includes(role));
}
