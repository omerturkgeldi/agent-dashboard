import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

/** Country flag (SVG through the flag-icons stylesheet, so it also shows on Windows). A globe when there is no flag. */
export function Flag({ code, className }: { code?: string | null; className?: string }) {
  if (!code) return <Globe className={cn("size-4 text-muted-foreground", className)} aria-hidden />;
  return <span className={cn("fi rounded-[2px]", `fi-${code.toLowerCase()}`, className)} aria-hidden />;
}
