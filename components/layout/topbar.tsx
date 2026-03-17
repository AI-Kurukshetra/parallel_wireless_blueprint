import { ShieldCheck, Wifi } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatEnumLabel } from "@/lib/utils/format";

type TopbarProps = {
  userName: string;
  tenantName: string;
  role: string;
};

export function Topbar({ userName, tenantName, role }: TopbarProps) {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-2 text-sm font-medium text-accent">
              <Wifi className="h-4 w-4" />
              Tenant-scoped workspace
            </div>
            <Badge tone="neutral">{tenantName}</Badge>
          </div>
          <p className="text-sm text-ink/60">
            All operational, billing, and analytics views are filtered to the signed-in tenant.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm">
            <p className="font-medium text-ink">{userName}</p>
            <p className="text-xs text-ink/55">{tenantName}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-medium text-ink">
            <ShieldCheck className="h-4 w-4 text-accent" />
            {formatEnumLabel(role)}
          </div>
          <SignOutButton />
        </div>
      </div>
    </Card>
  );
}
