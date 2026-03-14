alter table public.profiles
  add column if not exists email text,
  alter column tenant_id drop not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check
      check (role in ('owner', 'admin', 'operator', 'viewer'));
  end if;
end
$$;

create unique index if not exists idx_profiles_email_unique
  on public.profiles (email)
  where email is not null;

create or replace function public.current_tenant_id()
returns uuid
language sql
stable
as $$
  select tenant_id from public.profiles where id = auth.uid()
$$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_tenant_id uuid;
  requested_role text;
begin
  select id
  into resolved_tenant_id
  from public.tenants
  where slug = coalesce(new.raw_user_meta_data ->> 'tenant_slug', current_setting('app.settings.default_tenant_slug', true), 'oran-demo')
  limit 1;

  requested_role := lower(coalesce(new.raw_user_meta_data ->> 'role', 'operator'));
  if requested_role not in ('owner', 'admin', 'operator', 'viewer') then
    requested_role := 'operator';
  end if;

  insert into public.profiles (id, tenant_id, email, full_name, role)
  values (
    new.id,
    resolved_tenant_id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    requested_role
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    tenant_id = coalesce(public.profiles.tenant_id, excluded.tenant_id),
    role = public.profiles.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
for update using (auth.uid() = id);

drop policy if exists "tenants_select_own" on public.tenants;
create policy "tenants_select_own" on public.tenants
for select using (id = public.current_tenant_id());

drop policy if exists "subscription_plans_select_authenticated" on public.subscription_plans;
create policy "subscription_plans_select_authenticated" on public.subscription_plans
for select using (auth.role() = 'authenticated');

drop policy if exists "subscriptions_select_own_tenant" on public.subscriptions;
create policy "subscriptions_select_own_tenant" on public.subscriptions
for select using (tenant_id = public.current_tenant_id());

drop policy if exists "sites_select_own_tenant" on public.sites;
create policy "sites_select_own_tenant" on public.sites
for select using (tenant_id = public.current_tenant_id());

drop policy if exists "base_stations_select_own_tenant" on public.base_stations;
create policy "base_stations_select_own_tenant" on public.base_stations
for select using (tenant_id = public.current_tenant_id());

drop policy if exists "alarms_select_own_tenant" on public.alarms;
create policy "alarms_select_own_tenant" on public.alarms
for select using (tenant_id = public.current_tenant_id());

drop policy if exists "invoices_select_own_tenant" on public.invoices;
create policy "invoices_select_own_tenant" on public.invoices
for select using (tenant_id = public.current_tenant_id());

drop policy if exists "network_snapshots_select_own_tenant" on public.network_snapshots;
create policy "network_snapshots_select_own_tenant" on public.network_snapshots
for select using (tenant_id = public.current_tenant_id());
