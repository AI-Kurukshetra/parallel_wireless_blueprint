import Link from "next/link";

import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-telecom-700">Not found</p>
          <CardTitle>That record or page is not available.</CardTitle>
          <p className="text-sm leading-6 text-ink/65">
            The resource may not exist, may belong to another tenant, or may no longer be accessible.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <ButtonLink href="/dashboard">Return to dashboard</ButtonLink>
          <Link
            href="/login"
            className="inline-flex items-center rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-medium text-ink transition hover:border-accent/30"
          >
            Go to sign in
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
