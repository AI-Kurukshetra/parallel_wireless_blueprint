"use client";

import Link from "next/link";
import { Building2, LayoutDashboard, Shield, Users } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

const adminNavigation = [
  {
    href: "/admin",
    label: "Overview",
    description: "Platform summary",
    icon: LayoutDashboard
  },
  {
    href: "/admin/tenants",
    label: "Tenants",
    description: "Manage tenant accounts",
    icon: Building2
  },
  {
    href: "/admin/users",
    label: "Users",
    description: "Manage user access",
    icon: Users
  }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-[2rem] border border-white/70 bg-ink p-4 text-white shadow-panel">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">Platform admin</p>
        <p className="mt-3 text-2xl font-semibold leading-tight">
          Super admin
          <br />
          console
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm text-white/80">
          <Shield className="h-4 w-4" />
          Cross-tenant management
        </div>
      </div>

      <nav className="mt-6 space-y-2" aria-label="Super admin navigation">
        {adminNavigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-start gap-3 rounded-2xl px-4 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
                isActive ? "bg-white text-ink" : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className={cn("rounded-2xl p-2", isActive ? "bg-surface" : "bg-white/10")}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className={cn("text-xs", isActive ? "text-ink/60" : "text-white/45")}>{item.description}</p>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
