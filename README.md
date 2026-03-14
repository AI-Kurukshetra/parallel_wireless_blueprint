# ORAN Intelligence

Production-ready scaffold for a telecom network operations SaaS MVP.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + Postgres
- Vercel deployment target

## Structure

```text
app/            Routes, layouts, API handlers
components/     Shared UI primitives and layout components
features/       Feature modules by domain
lib/            Supabase, auth, config, and utilities
supabase/       Migrations and seed SQL
types/          Shared domain and database types
```

## Getting Started

1. Install dependencies with `npm install`
2. Copy `.env.example` values into `.env.local`
3. Apply `supabase/migrations/202603141430_initial_schema.sql`
4. Apply `supabase/migrations/202603141900_auth_profiles_and_policies.sql`
5. Run `supabase/seed.sql`
6. Create a Supabase Auth user with metadata:
   `{"full_name":"Demo Operator","tenant_slug":"oran-demo","role":"operator"}`
7. Run `npm run dev`

## Database

The app reads from Supabase database tables only. Local setup artifacts live in:

- `supabase/migrations/202603141430_initial_schema.sql`
- `supabase/migrations/202603141900_auth_profiles_and_policies.sql`
- `supabase/seed.sql`

## Authentication

- Sign-in uses Supabase Auth email/password
- Protected app routes live under `app/(app)`
- Authenticated users resolve tenant context from `profiles.tenant_id`
- `DEFAULT_TENANT_SLUG` is only a fallback for local/demo unauthenticated paths

## Feature Areas

- dashboard
- sites
- base-stations
- alarms
- billing
- analytics
- settings
