"use client";

import { useEffect } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-telecom-700">Application error</p>
          <CardTitle>Something went wrong while loading this view.</CardTitle>
          <p className="text-sm leading-6 text-ink/65">
            The request failed safely. You can retry, return to the dashboard, or refresh the page after checking your session and tenant setup.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Retry
          </button>
          <ButtonLink href="/dashboard" className="bg-white text-ink ring-1 ring-ink/10">
            Back to dashboard
          </ButtonLink>
        </CardContent>
      </Card>
    </main>
  );
}
