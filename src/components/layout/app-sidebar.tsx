"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import type { User } from "@/lib/api/types";
import { canAccess, quickAction, visibleNav } from "@/lib/config/nav";
import { Logo } from "./logo";
import { NavUser } from "./nav-user";

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

// The active page gets the theme's accent color.
const activeStyle = "data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground data-active:shadow-sm";

export function AppSidebar({ user }: { user: User }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const closeOnMobile = () => isMobile && setOpenMobile(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" onClick={closeOnMobile} />}>
              <Logo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {quickAction && canAccess(quickAction, user.roles) && (
          <SidebarGroup className="pb-0">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={t(quickAction.label)}
                  className="bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground active:bg-sidebar-primary/90 active:text-sidebar-primary-foreground"
                  render={<Link href={quickAction.href} onClick={closeOnMobile} />}
                >
                  <quickAction.icon />
                  <span>{t(quickAction.label)}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
        {visibleNav(user.roles).map((group) => (
          <SidebarGroup key={group.label} className={group.pinned ? "mt-auto" : undefined}>
            <SidebarGroupLabel>{t(group.label)}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) =>
                item.children ? (
                  <Collapsible key={item.label} defaultOpen={item.children.some((c) => isActive(pathname, c.href))} render={<SidebarMenuItem />}>
                    <CollapsibleTrigger
                      render={
                        <SidebarMenuButton
                          tooltip={t(item.label)}
                          isActive={item.children.some((c) => isActive(pathname, c.href))}
                          className="group/trigger data-active:font-medium data-active:text-sidebar-primary"
                        />
                      }
                    >
                      <item.icon />
                      <span>{t(item.label)}</span>
                      <ChevronRight className="ml-auto transition-transform group-data-[panel-open]/trigger:rotate-90" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children.map((child) => (
                          <SidebarMenuSubItem key={child.href}>
                            <SidebarMenuSubButton
                              isActive={isActive(pathname, child.href)}
                              className="data-active:font-medium data-active:text-sidebar-primary"
                              render={<Link href={child.href} onClick={closeOnMobile} />}
                            >
                              <span>{t(child.label)}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      isActive={isActive(pathname, item.href!)}
                      tooltip={t(item.label)}
                      className={activeStyle}
                      render={<Link href={item.href!} onClick={closeOnMobile} />}
                    >
                      <item.icon />
                      <span>{t(item.label)}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
