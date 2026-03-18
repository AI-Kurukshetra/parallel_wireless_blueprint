alter table public.tenants
  add column if not exists is_active boolean not null default true;

alter table public.profiles
  add column if not exists is_active boolean not null default true,
  add column if not exists is_super_admin boolean not null default false;

create index if not exists idx_profiles_is_super_admin on public.profiles (is_super_admin);
create index if not exists idx_profiles_is_active on public.profiles (is_active);
create index if not exists idx_tenants_is_active on public.tenants (is_active);
