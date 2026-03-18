import { ReactNode } from "react";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AdminShell({
  children,
  viewer
}: {
  children: ReactNode;
  viewer: {
    name: string;
    role: string;
  };
}) {
  return (
    <div className="mx-auto min-h-screen max-w-[1600px] px-4 py-4 lg:px-6">
      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="xl:sticky xl:top-4 xl:self-start">
          <AdminSidebar />
        </div>
        <main className="space-y-4">
          <Topbar userName={viewer.name} tenantName="Platform" role={viewer.role} />
          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
