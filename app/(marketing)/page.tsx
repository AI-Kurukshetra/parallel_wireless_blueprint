import Link from "next/link";
import { Activity, ArrowRight, ShieldCheck, TowerControl } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { getDefaultSignedInPath } from "@/lib/auth/access";
import { getSession } from "@/lib/auth/session";
import { appConfig } from "@/lib/config/app";

const highlights = [
  {
    title: "Operational visibility",
    description: "Unify sites, base stations, alarms, and billing in a single operator workspace.",
    icon: Activity
  },
  {
    title: "Secure by default",
    description: "Supabase auth, Postgres, and row-level security shape the multi-tenant foundation.",
    icon: ShieldCheck
  },
  {
    title: "Built for distributed networks",
    description: "Track rural infrastructure performance without relying on fragile spreadsheets.",
    icon: TowerControl
  }
];

export default async function MarketingPage() {
  const session = await getSession();
  const signedInHref = session ? await getDefaultSignedInPath() : "/login";

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10 lg:px-10">
      <header className="flex items-center justify-between rounded-full border border-white/70 bg-white/80 px-5 py-3 shadow-panel backdrop-blur">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-telecom-700">
            {appConfig.name}
          </p>
          <p className="text-xs text-ink/60">{appConfig.tagline}</p>
        </div>
        <ButtonLink href={signedInHref}>
          {session ? "Open Workspace" : "Sign In"}
        </ButtonLink>
      </header>

      <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <div className="space-y-5">
            <p className="inline-flex rounded-full border border-telecom-300 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-telecom-700">
              Telecom network operations MVP
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-ink md:text-6xl">
              Run rural network operations from one resilient SaaS control center.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-ink/70">
              Monitor tower health, alarm trends, network coverage, subscriber billing, and field
              operations through a production-ready Next.js and Supabase foundation.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <ButtonLink href={signedInHref} className="min-w-40 justify-center">
              {session ? "Enter Dashboard" : "Sign In"}
            </ButtonLink>
            <Link
              href="/settings"
              className="inline-flex min-w-40 items-center justify-center rounded-full border border-ink/15 px-5 py-3 text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-white/70"
            >
              Review Settings
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-panel backdrop-blur">
          <div className="rounded-[1.5rem] bg-telecom-900 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-white/50">Live network pulse</p>
                <p className="mt-2 text-4xl font-semibold">98.4%</p>
              </div>
              <span className="rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-blue-100">
                Stable
              </span>
            </div>

            <div className="mt-8 grid gap-4">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="rounded-2xl bg-white/10 p-3">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-white/65">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href={signedInHref}
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-white/90"
            >
              {session ? "View tenant dashboard" : "Sign in to continue"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
