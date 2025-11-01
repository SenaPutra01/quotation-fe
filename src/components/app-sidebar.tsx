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
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Truck,
  CreditCard,
  Shield,
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

const iconMap: { [key: string]: React.ElementType } = {
  dashboard: LayoutDashboard,
  quotations: FileText,
  purchase_orders: ShoppingCart,
  delivery_orders: Truck,
  invoices: CreditCard,
  reports: PieChart,
  sales: PieChart,
  financial: PieChart,
  users: Users,
  roles: Shield,
  permissions: Settings2,
  finance: SquareTerminal,
  manage_users: Users,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [navMain, setNavMain] = React.useState<any[]>([]);

  React.useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      setNavMain(getDefaultMenu());
      return;
    }

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
          icon: iconMap[p.resource],
        }));

      const manageUserItems = readablePermissions
        .filter((p: any) => manageUserResources.includes(p.resource))
        .map((p: any) => ({
          title:
            p.resource
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Untitled",
          url: p.url,
          icon: iconMap[p.resource],
        }));

      const dynamicNav: any[] = [];

      const dashboardPermission = readablePermissions.find(
        (p: any) => p.resource === "dashboard"
      );
      dynamicNav.push({
        title: "Dashboard",
        url: dashboardPermission?.url || "/dashboard",
        icon: LayoutDashboard,
        isActive: true,
      });

      if (financeItems.length > 0) {
        dynamicNav.push({
          title: "Finance",
          url: "#",
          icon: SquareTerminal,
          items: financeItems,
        });
      }

      const hasReportPermissions = readablePermissions.some(
        (p: any) => p.resource === "sales" || p.resource === "financial"
      );

      if (hasReportPermissions) {
        dynamicNav.push({
          title: "Reports",
          url: "#",
          icon: PieChart,
          items: [
            {
              title: "Sales Report",
              url: "/reports/sales",
              icon: iconMap.sales,
            },
            {
              title: "Financial Report",
              url: "/reports/financial",
              icon: iconMap.financial,
            },
          ],
        });
      }

      if (manageUserItems.length > 0) {
        dynamicNav.push({
          title: "Manage Users",
          url: "#",
          icon: Users,
          items: manageUserItems,
        });
      }

      const otherPermissions = readablePermissions.filter(
        (p: any) =>
          p.resource !== "dashboard" &&
          !financeResources.includes(p.resource) &&
          !manageUserResources.includes(p.resource) &&
          p.resource !== "sales" &&
          p.resource !== "financial"
      );

      otherPermissions.forEach((permission: any) => {
        dynamicNav.push({
          title: permission.resource
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l: string) => l.toUpperCase()),
          url: permission.url,
          icon: iconMap[permission.resource] || FileText,
        });
      });

      setNavMain(dynamicNav);
    } catch (error) {
      console.error("Failed to parse user data:", error);

      setNavMain(getDefaultMenu());
    }
  }, []);

  const getDefaultMenu = () => [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Finance",
      url: "#",
      icon: SquareTerminal,
      items: [
        {
          title: "Quotations",
          url: "/quotations",
          icon: FileText,
        },
        {
          title: "Purchase Orders",
          url: "/purchase-orders",
          icon: ShoppingCart,
        },
        {
          title: "Delivery Orders",
          url: "/delivery-orders",
          icon: Truck,
        },
        {
          title: "Invoices",
          url: "/invoices",
          icon: CreditCard,
        },
      ],
    },
    {
      title: "Reports",
      url: "#",
      icon: PieChart,
      items: [
        {
          title: "Sales Report",
          url: "/reports/sales",
          icon: PieChart,
        },
        {
          title: "Financial Report",
          url: "/reports/financial",
          icon: PieChart,
        },
      ],
    },
  ];

  const data = {
    user: {
      name: "Super Admin",
      email: "superadmin@gmail.com",
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
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
