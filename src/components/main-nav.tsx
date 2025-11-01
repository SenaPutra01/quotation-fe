import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Icons } from "@/components/icons";

export function MainNav() {
  const { user } = useAuth();

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/dashboard" className="flex items-center space-x-2">
        <Icons.logo className="h-6 w-6" />
        <span className="inline-block font-bold">Dashboard</span>
      </Link>
      <nav className="flex gap-6">
        <Link
          href="/dashboard"
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Overview
        </Link>
        <Link
          href="/dashboard/users"
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Users
        </Link>
        <Link
          href="/dashboard/settings"
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Settings
        </Link>
      </nav>
    </div>
  );
}
