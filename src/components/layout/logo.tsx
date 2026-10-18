import { LayoutGrid } from "lucide-react";
import { appName, appTagline } from "@/lib/config/app";

/** Replace the icon with your own logo. Text comes from lib/config/app.ts. */
export function Logo() {
  return (
    <>
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
        <LayoutGrid className="size-4" />
      </div>
      <div className="grid flex-1 text-left leading-tight">
        <span className="truncate font-semibold">{appName}</span>
        <span className="truncate text-xs text-sidebar-foreground/60">{appTagline}</span>
      </div>
    </>
  );
}
