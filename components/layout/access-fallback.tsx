import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AccessFallbackProps = {
  title: string;
  description: string;
  email?: string;
};

export function AccessFallback({ title, description, email }: AccessFallbackProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-telecom-700">
            Account setup required
          </p>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6 text-ink/70">
          <p>{description}</p>
          {email ? (
            <p className="rounded-2xl bg-surface px-4 py-3 text-ink">
              Signed in as <span className="font-medium">{email}</span>
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Link
              href="mailto:support@example.com?subject=ORAN%20Intelligence%20Access"
              className="inline-flex items-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
            >
              Contact support
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-medium text-ink"
            >
              Return to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
