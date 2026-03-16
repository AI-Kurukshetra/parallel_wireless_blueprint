alter table public.subscription_plans
  add column if not exists billing_interval text not null default 'monthly',
  add column if not exists currency text not null default 'USD',
  add column if not exists is_active boolean not null default true,
  add column if not exists feature_summary jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'subscription_plans_billing_interval_check'
  ) then
    alter table public.subscription_plans
      add constraint subscription_plans_billing_interval_check
      check (billing_interval in ('monthly', 'quarterly', 'annual'));
  end if;
end
$$;

alter table public.subscriptions
  add column if not exists current_period_start date,
  add column if not exists current_period_end date,
  add column if not exists grace_ends_at date,
  add column if not exists suspended_at timestamptz,
  add column if not exists canceled_at timestamptz;

create table if not exists public.billing_cycles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  cycle_start date not null,
  cycle_end date not null,
  invoice_date date not null,
  due_date date not null,
  status text not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'billing_cycles_status_check'
  ) then
    alter table public.billing_cycles
      add constraint billing_cycles_status_check
      check (status in ('scheduled', 'invoiced', 'paid', 'overdue', 'closed'));
  end if;
end
$$;

alter table public.invoices
  add column if not exists invoice_number text,
  add column if not exists issue_date date,
  add column if not exists subtotal_cents integer not null default 0,
  add column if not exists total_cents integer not null default 0,
  add column if not exists currency text not null default 'USD',
  add column if not exists billing_cycle_id uuid references public.billing_cycles (id) on delete set null,
  add column if not exists paid_at timestamptz,
  add column if not exists paid_by_profile_id uuid references public.profiles (id) on delete set null,
  add column if not exists status_updated_at timestamptz,
  add column if not exists status_updated_by_profile_id uuid references public.profiles (id) on delete set null;

alter table public.invoices
  alter column status drop default;

do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'invoices_status_check'
  ) then
    alter table public.invoices drop constraint invoices_status_check;
  end if;
end
$$;

update public.invoices
set
  status = case
    when status = 'pending' then 'issued'
    else status
  end,
  issue_date = coalesce(issue_date, due_date)
where status in ('pending', 'paid', 'overdue');

alter table public.invoices
  add constraint invoices_status_check
  check (status in ('draft', 'issued', 'paid', 'overdue', 'void'));

create table if not exists public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  description text not null,
  quantity integer not null default 1,
  unit_amount_cents integer not null default 0,
  total_amount_cents integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_billing_cycles_tenant_id on public.billing_cycles (tenant_id);
create index if not exists idx_billing_cycles_subscription_id on public.billing_cycles (subscription_id);
create index if not exists idx_invoices_billing_cycle_id on public.invoices (billing_cycle_id);
create index if not exists idx_invoice_line_items_invoice_id on public.invoice_line_items (invoice_id);

drop trigger if exists billing_cycles_set_updated_at on public.billing_cycles;
create trigger billing_cycles_set_updated_at before update on public.billing_cycles
for each row execute function public.set_updated_at();

alter table public.billing_cycles enable row level security;
alter table public.invoice_line_items enable row level security;

drop policy if exists "billing_cycles_select_own_tenant" on public.billing_cycles;
create policy "billing_cycles_select_own_tenant" on public.billing_cycles
for select using (tenant_id = public.current_tenant_id());

drop policy if exists "invoice_line_items_select_own_tenant" on public.invoice_line_items;
create policy "invoice_line_items_select_own_tenant" on public.invoice_line_items
for select using (tenant_id = public.current_tenant_id());
