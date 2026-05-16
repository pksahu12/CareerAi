import Link from "next/link";
import { LayoutDashboard, Settings, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/settings/billing", label: "Billing", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card px-4 py-6">
      <div className="mb-8 px-2">
        <Link href="/" className="text-xl font-bold tracking-tight">
          LaunchVector
        </Link>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
