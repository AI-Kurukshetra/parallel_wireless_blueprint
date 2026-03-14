import { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";

type AppShellProps = {
  children: ReactNode;
  viewer: {
    name: string;
    tenantName: string;
    role: string;
  };
};

export function AppShell({ children, viewer }: AppShellProps) {
  return (
    <div className="mx-auto min-h-screen max-w-[1600px] px-4 py-4 lg:px-6">
      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="xl:sticky xl:top-4 xl:self-start">
          <AppSidebar tenantName={viewer.tenantName} />
        </div>
        <main className="space-y-4">
          <Topbar userName={viewer.name} tenantName={viewer.tenantName} role={viewer.role} />
          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
