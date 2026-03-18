import { redirect } from "next/navigation";

import { Field } from "@/components/forms/field";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signInAction } from "@/lib/auth/actions";
import { getDefaultSignedInPath } from "@/lib/auth/access";
import { getSession } from "@/lib/auth/session";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;

  if (session) {
    redirect(params.next ?? (await getDefaultSignedInPath()));
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-telecom-700">
            Supabase authentication
          </p>
          <CardTitle>Sign in to the ORAN operations workspace.</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm text-ink/70">
          <p>
            Sign in with an email/password user from Supabase Auth. Accounts are linked to tenants
            through the `profiles` table and user metadata bootstrap flow.
          </p>
          <form action={signInAction} className="space-y-4">
            <input type="hidden" name="next" value={params.next ?? ""} />
            <Field label="Email" name="email" type="email" autoComplete="email" required />
            <Field
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            {params.error ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</p>
            ) : null}
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-95"
            >
              Sign in
            </button>
          </form>
          <ButtonLink href="/" className="w-full justify-center bg-white text-ink ring-1 ring-ink/10">
            Back to overview
          </ButtonLink>
        </CardContent>
      </Card>
    </main>
  );
}
