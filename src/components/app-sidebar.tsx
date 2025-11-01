"use client";

import * as React from "react";
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [navMain, setNavMain] = React.useState<any[]>([]);

  React.useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) return;

    try {
      const parsedUser = JSON.parse(userData);
      const permissions = parsedUser?.permissions || [];

      const readablePermissions = permissions.filter(
        (p: any) => p.action === "read"
      );

      const financeResources = [
        "quotations",
        "purchase_orders",
        "delivery_orders",
        "invoices",
      ];
      const manageUserResources = ["users", "roles", "permissions"];

      const financeItems = readablePermissions
        .filter((p: any) => financeResources.includes(p.resource))
        .map((p: any) => ({
          title:
            p.resource
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Untitled",
          url: p.url,
        }));

      const manageUserItems = readablePermissions
        .filter((p: any) => manageUserResources.includes(p.resource))
        .map((p: any) => ({
          title:
            p.resource
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Untitled",
          url: p.url,
        }));

      const dynamicNav: any[] = [];

      if (financeItems.length > 0) {
        dynamicNav.push({
          title: "Finance",
          url: "#",
          icon: SquareTerminal,
          isActive: true,
          items: financeItems,
        });
      }

      dynamicNav.push({
        title: "Reports",
        url: "#",
        icon: PieChart,
        items: [
          { title: "Sales Report", url: "/reports/sales" },
          { title: "Financial Report", url: "/reports/financial" },
        ],
      });

      if (manageUserItems.length > 0) {
        dynamicNav.push({
          title: "Manage Users",
          url: "#",
          icon: Users,
          items: manageUserItems,
        });
      }

      setNavMain(dynamicNav);
    } catch (error) {
      console.error("Failed to parse user data:", error);
    }
  }, []);

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      { name: "Finance Morp", logo: GalleryVerticalEnd, plan: "Enterprise" },
      { name: "Acme Corp.", logo: AudioWaveform, plan: "Startup" },
      { name: "Evil Corp.", logo: Command, plan: "Free" },
    ],
    navMain,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
