insert into public.tenants (id, name, slug, default_region, critical_alarm_threshold)
values
  ('00000000-0000-0000-0000-000000000001', 'ORAN Demo Tenant', 'oran-demo', 'Rajasthan', 10)
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  default_region = excluded.default_region,
  critical_alarm_threshold = excluded.critical_alarm_threshold;

insert into public.subscription_plans (
  id,
  code,
  name,
  price_monthly_cents,
  site_limit,
  base_station_limit,
  support_tier
)
values
  ('10000000-0000-0000-0000-000000000001', 'field-starter', 'Field Starter', 49000, 50, 200, 'Business hours'),
  ('10000000-0000-0000-0000-000000000002', 'network-scale', 'Network Scale', 129000, 250, 1200, '24/7 NOC'),
  ('10000000-0000-0000-0000-000000000003', 'operator-plus', 'Operator Plus', 249000, 1000, 5000, 'Dedicated TAM')
on conflict (id) do update
set
  code = excluded.code,
  name = excluded.name,
  price_monthly_cents = excluded.price_monthly_cents,
  site_limit = excluded.site_limit,
  base_station_limit = excluded.base_station_limit,
  support_tier = excluded.support_tier;

-- Demo auth user setup:
-- 1. Create a user in Supabase Auth with email/password through the dashboard or auth admin API.
-- 2. Include user metadata:
--    { "full_name": "Demo Operator", "tenant_slug": "oran-demo", "role": "operator" }
-- 3. The auth trigger in 202603141900_auth_profiles_and_policies.sql will create the matching profile row.

insert into public.subscriptions (id, tenant_id, plan_id, status, seats, started_at, renews_at)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    'active',
    24,
    '2026-01-01',
    '2026-04-01'
  )
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  plan_id = excluded.plan_id,
  status = excluded.status,
  seats = excluded.seats,
  started_at = excluded.started_at,
  renews_at = excluded.renews_at;

insert into public.sites (
  id,
  tenant_id,
  name,
  code,
  region,
  uptime,
  subscribers,
  status,
  technology,
  coverage_percent,
  monthly_energy_cost_cents
)
values
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Bikaner North Relay', 'RAJ-BIK-S01', 'Rajasthan', 99.1, 18200, 'online', '4G / ORAN', 82, 284000),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Kutch Solar Ridge', 'GUJ-KUT-S04', 'Gujarat', 97.4, 11340, 'degraded', '4G / Microwave', 76, 246000),
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Vidisha Rural Edge', 'MP-VID-S11', 'Madhya Pradesh', 95.8, 8920, 'degraded', '5G NSA / Fiber', 78, 259000),
  ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Thanjavur Delta Hub', 'TN-THA-S07', 'Tamil Nadu', 99.6, 24110, 'online', '4G / Fiber', 84, 272000),
  ('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Koraput Highlands', 'ODI-KOR-S03', 'Odisha', 91.2, 5340, 'offline', '4G / VSAT', 68, 225000)
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  name = excluded.name,
  code = excluded.code,
  region = excluded.region,
  uptime = excluded.uptime,
  subscribers = excluded.subscribers,
  status = excluded.status,
  technology = excluded.technology,
  coverage_percent = excluded.coverage_percent,
  monthly_energy_cost_cents = excluded.monthly_energy_cost_cents;

insert into public.base_stations (
  id,
  tenant_id,
  site_id,
  code,
  vendor,
  power_level,
  backhaul_usage,
  status
)
values
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'RAJ-BIK-01', 'Parallel Wireless', 82, 64, 'online'),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'GUJ-KUT-04', 'Mavenir', 67, 71, 'degraded'),
  ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', 'MP-VID-11', 'Rakuten Symphony', 58, 83, 'degraded'),
  ('40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004', 'TN-THA-07', 'Nokia', 88, 52, 'online'),
  ('40000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000005', 'ODI-KOR-03', 'Airspan', 31, 95, 'offline')
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  site_id = excluded.site_id,
  code = excluded.code,
  vendor = excluded.vendor,
  power_level = excluded.power_level,
  backhaul_usage = excluded.backhaul_usage,
  status = excluded.status;

insert into public.alarms (
  id,
  tenant_id,
  site_id,
  base_station_id,
  title,
  severity,
  category,
  acknowledged,
  created_at
)
values
  ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000005', 'Battery reserve below threshold', 'critical', 'Power', false, '2026-03-14T05:20:00Z'),
  ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'Microwave link packet loss', 'high', 'Backhaul', true, '2026-03-14T07:35:00Z'),
  ('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', 'Sector temperature elevated', 'medium', 'Hardware', false, '2026-03-14T08:45:00Z'),
  ('50000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', null, 'Generator maintenance overdue', 'low', 'Maintenance', true, '2026-03-13T18:15:00Z')
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  site_id = excluded.site_id,
  base_station_id = excluded.base_station_id,
  title = excluded.title,
  severity = excluded.severity,
  category = excluded.category,
  acknowledged = excluded.acknowledged,
  created_at = excluded.created_at;

insert into public.invoices (
  id,
  tenant_id,
  subscription_id,
  account_name,
  amount_cents,
  due_date,
  status
)
values
  ('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Rural Connect Cooperative', 4200000, '2026-03-18', 'paid'),
  ('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Village Broadband Cluster A', 3180000, '2026-03-21', 'pending'),
  ('60000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'AgriNet Distribution South', 1575000, '2026-03-10', 'overdue'),
  ('60000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Community Wireless Program', 2790000, '2026-03-28', 'pending')
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  subscription_id = excluded.subscription_id,
  account_name = excluded.account_name,
  amount_cents = excluded.amount_cents,
  due_date = excluded.due_date,
  status = excluded.status;

insert into public.network_snapshots (
  id,
  tenant_id,
  label,
  coverage,
  utilization,
  energy_cost_cents,
  snapshot_date
)
values
  ('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Week 1', 72, 61, 1420000, '2026-02-14'),
  ('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Week 2', 76, 65, 1385000, '2026-02-21'),
  ('70000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Week 3', 78, 69, 1362000, '2026-02-28'),
  ('70000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Week 4', 82, 73, 1314000, '2026-03-07')
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  label = excluded.label,
  coverage = excluded.coverage,
  utilization = excluded.utilization,
  energy_cost_cents = excluded.energy_cost_cents,
  snapshot_date = excluded.snapshot_date;
