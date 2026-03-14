import { Bell, Search, Wifi } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Card } from "@/components/ui/card";

type TopbarProps = {
  userName: string;
  tenantName: string;
  role: string;
};

export function Topbar({ userName, tenantName, role }: TopbarProps) {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 rounded-full border border-ink/10 bg-surface px-4 py-2">
          <Search className="h-4 w-4 text-ink/40" />
          <span className="text-sm text-ink/50">Search site, alarm, invoice, or subscriber</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-2 text-sm font-medium text-accent">
            <Wifi className="h-4 w-4" />
            {tenantName} • {role}
          </div>
          <div className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm">
            <p className="font-medium text-ink">{userName}</p>
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white text-ink/70 transition hover:border-ink/20"
          >
            <Bell className="h-4 w-4" />
          </button>
          <SignOutButton />
        </div>
      </div>
    </Card>
  );
}
