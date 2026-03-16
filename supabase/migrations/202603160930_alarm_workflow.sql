alter table public.alarms
  add column if not exists status text not null default 'open',
  add column if not exists description text,
  add column if not exists message text,
  add column if not exists source_vendor text,
  add column if not exists assignee_profile_id uuid references public.profiles (id) on delete set null,
  add column if not exists assigned_by_profile_id uuid references public.profiles (id) on delete set null,
  add column if not exists assigned_at timestamptz,
  add column if not exists acknowledged_by_profile_id uuid references public.profiles (id) on delete set null,
  add column if not exists acknowledged_at timestamptz,
  add column if not exists resolved_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'alarms_status_check'
  ) then
    alter table public.alarms
      add constraint alarms_status_check
      check (status in ('open', 'acknowledged', 'in_progress', 'resolved', 'closed'));
  end if;
end
$$;

update public.alarms
set
  status = case
    when acknowledged then 'acknowledged'
    else 'open'
  end
where status is null or status = '';

create table if not exists public.alarm_notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  alarm_id uuid not null references public.alarms (id) on delete cascade,
  author_profile_id uuid references public.profiles (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.alarm_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  alarm_id uuid not null references public.alarms (id) on delete cascade,
  actor_profile_id uuid references public.profiles (id) on delete set null,
  event_type text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_alarm_notes_alarm_id on public.alarm_notes (alarm_id, created_at desc);
create index if not exists idx_alarm_events_alarm_id on public.alarm_events (alarm_id, created_at desc);
create index if not exists idx_alarms_status on public.alarms (tenant_id, status);
create index if not exists idx_alarms_assignee on public.alarms (tenant_id, assignee_profile_id);

alter table public.alarm_notes enable row level security;
alter table public.alarm_events enable row level security;

drop policy if exists "alarm_notes_select_own_tenant" on public.alarm_notes;
create policy "alarm_notes_select_own_tenant" on public.alarm_notes
for select using (tenant_id = public.current_tenant_id());

drop policy if exists "alarm_events_select_own_tenant" on public.alarm_events;
create policy "alarm_events_select_own_tenant" on public.alarm_events
for select using (tenant_id = public.current_tenant_id());
