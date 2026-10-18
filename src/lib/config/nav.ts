import { Bell, History, Languages, LayoutDashboard, ScrollText, ShieldCheck, UserCircle, UserPlus, type LucideIcon } from "lucide-react";
import { ROLES, type RoleName } from "@/lib/api/types";

type Label = "dashboard" | "access" | "users" | "roles" | "logs" | "audit" | "translations" | "notifications" | "profile"; // keys in messages.nav
type GroupLabel = "overview" | "management" | "system" | "account"; // keys in messages.nav

interface NavLink {
  label: Label;
  href: string;
  /** Roles allowed to see the page. Omit for every signed-in user. */
  roles?: RoleName[];
}

/** A sidebar entry: either a link (`href`) or a collapsible parent with `children`. */
interface NavItem {
  label: Label;
  icon: LucideIcon;
  href?: string;
  children?: NavLink[];
  roles?: RoleName[];
}

interface NavGroup {
  label: GroupLabel;
  items: NavItem[];
  /** Sticks to the bottom of the sidebar. */
  pinned?: boolean;
}

const admins = [ROLES.SuperAdmin, ROLES.Admin];

export const navGroups: NavGroup[] = [
  { label: "overview", items: [{ label: "dashboard", icon: LayoutDashboard, href: "/" }] },
  {
    label: "management",
    items: [
      {
        label: "access",
        icon: ShieldCheck,
        roles: admins,
        children: [
          { label: "users", href: "/users" },
          { label: "roles", href: "/roles" },
        ],
      },
      { label: "translations", icon: Languages, href: "/translations", roles: [...admins, ROLES.Translator] },
    ],
  },
  {
    label: "system",
    items: [
      { label: "logs", icon: ScrollText, href: "/logs", roles: [...admins, ROLES.Tech] },
      { label: "audit", icon: History, href: "/audit", roles: admins },
    ],
  },
  {
    label: "account",
    pinned: true,
    items: [
      { label: "notifications", icon: Bell, href: "/notifications" },
      { label: "profile", icon: UserCircle, href: "/profile" },
    ],
  },
];

/** The highlighted button at the top of the sidebar (and in the command palette). Set to null to remove it. */
export const quickAction: { label: "newUser"; icon: LucideIcon; href: string; roles?: RoleName[] } | null = {
  label: "newUser",
  icon: UserPlus,
  href: "/users?new=1",
  roles: admins,
};

interface NavPage extends NavLink {
  group: GroupLabel;
  parent?: Label;
  icon: LucideIcon;
}

/** Every page as one flat list, used for role checks and breadcrumbs. */
export const navPages: NavPage[] = navGroups.flatMap((group) =>
  group.items.flatMap((item): NavPage[] =>
    item.children
      ? item.children.map((child) => ({ ...child, roles: child.roles ?? item.roles, group: group.label, parent: item.label, icon: item.icon }))
      : [{ label: item.label, href: item.href!, roles: item.roles, group: group.label, icon: item.icon }],
  ),
);

export function canAccess(entry: { roles?: RoleName[] }, userRoles: string[]) {
  return !entry.roles || entry.roles.some((role) => userRoles.includes(role));
}

/** The groups and items a user may see. Children inherit the parent's roles unless they set their own. */
export function visibleNav(userRoles: string[]): NavGroup[] {
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => canAccess(item, userRoles))
        .map((item) => ({ ...item, children: item.children?.filter((child) => canAccess({ roles: child.roles ?? item.roles }, userRoles)) }))
        .filter((item) => !item.children || item.children.length > 0),
    }))
    .filter((group) => group.items.length > 0);
}

/** The page a path belongs to (`/users/123` belongs to `/users`). */
export function findPage(pathname: string) {
  return navPages.find((page) => (page.href === "/" ? pathname === "/" : pathname.startsWith(page.href)));
}
