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
5. Apply `supabase/migrations/202603142030_sites_and_stations_soft_deactivate.sql`
6. Apply `supabase/migrations/202603142130_uuid_defaults.sql`
7. Apply `supabase/migrations/202603160930_alarm_workflow.sql`
8. Apply `supabase/migrations/202603161130_billing_workflow.sql`
9. Apply `supabase/migrations/202603181030_super_admin_controls.sql`
10. Run `supabase/seed.sql`
11. Create a Supabase Auth user with metadata:
   `{"full_name":"Demo Admin","tenant_slug":"oran-demo","role":"admin"}`
12. Promote the first platform admin profile manually:
   `update public.profiles set is_super_admin = true where email = 'demo-admin@example.com';`
13. Run `npm run dev`

## Database

The app reads from Supabase database tables only. Local setup artifacts live in:

- `supabase/migrations/202603141430_initial_schema.sql`
- `supabase/migrations/202603141900_auth_profiles_and_policies.sql`
- `supabase/migrations/202603142030_sites_and_stations_soft_deactivate.sql`
- `supabase/migrations/202603142130_uuid_defaults.sql`
- `supabase/migrations/202603160930_alarm_workflow.sql`
- `supabase/migrations/202603161130_billing_workflow.sql`
- `supabase/migrations/202603181030_super_admin_controls.sql`
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
