"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/lib/config/nav";
import { cn } from "@/lib/utils/cn";

export function AppSidebar({ tenantName }: { tenantName: string }) {
  const pathname = usePathname();

  return (
    <aside className="rounded-[2rem] border border-white/70 bg-telecom-900 p-4 text-white shadow-panel">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">ORAN Intelligence</p>
        <p className="mt-3 text-2xl font-semibold leading-tight">
          Rural network
          <br />
          command center
        </p>
        <p className="mt-4 rounded-2xl bg-white/10 px-3 py-2 text-sm text-white/75">{tenantName}</p>
      </div>

      <nav className="mt-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-start gap-3 rounded-2xl px-4 py-3 transition",
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
