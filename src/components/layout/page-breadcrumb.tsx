"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { findPage } from "@/lib/config/nav";

/** "Access / Users": the parent (or the group) and the current page. */
export function PageBreadcrumb() {
  const t = useTranslations("nav");
  const ta = useTranslations("a11y");
  const page = findPage(usePathname());
  if (!page) return null;

  return (
    <Breadcrumb aria-label={ta("breadcrumb")}>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden sm:inline-flex">{t(page.parent ?? page.group)}</BreadcrumbItem>
        <BreadcrumbSeparator className="hidden sm:block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{t(page.label)}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
