"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "./modeToggle";
import { ThemeSelector } from "./themeSelector";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

const customLabels: Record<string, string> = {
  dashboard: "Dashboard",
  quotation: "Quotations",
  "purchase-order": "Purchase Orders",
  customers: "Customers",
  reports: "Reports",
  settings: "Settings",
  new: "New",
};

export function SiteHeader() {
  const pathname = usePathname();

  const generateBreadcrumbs = () => {
    const paths = pathname.split("/").filter((path) => path !== "");
    return paths.map((path, index) => {
      const href = "/" + paths.slice(0, index + 1).join("/");
      const label =
        customLabels[path] ||
        path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
      return { href, label, isLast: index === paths.length - 1 };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  if (pathname === "/dashboard" || pathname === "/") {
    return (
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />

          <h1 className="text-lg font-semibold">Dashboard</h1>

          <div className="ml-auto flex items-center gap-2">
            <ModeToggle />
            <ThemeSelector />
          </div>
        </div>
      </header>
    );
  }

  const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        <nav
          className="flex-1 flex items-center text-sm min-w-0"
          aria-label="Breadcrumb"
        >
          {breadcrumbs.length > 0 && (
            <>
              <span className="sm:hidden font-medium text-foreground truncate">
                {lastBreadcrumb.label}
              </span>

              <div className="hidden sm:flex items-center min-w-0">
                {breadcrumbs.map((breadcrumb, index) => (
                  <div key={breadcrumb.href} className="flex items-center">
                    {index > 0 && (
                      <ChevronRight className="h-3 w-3 text-muted-foreground mx-1" />
                    )}
                    {breadcrumb.isLast ? (
                      <span className="font-medium text-foreground truncate">
                        {breadcrumb.label}
                      </span>
                    ) : (
                      <Link
                        href={breadcrumb.href}
                        className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-20 lg:max-w-32"
                      >
                        {breadcrumb.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          <ThemeSelector />
        </div>
      </div>
    </header>
  );
}
