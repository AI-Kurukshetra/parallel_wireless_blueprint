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
  billing_interval,
  currency,
  is_active,
  site_limit,
  base_station_limit,
  support_tier,
  feature_summary
)
values
  ('10000000-0000-0000-0000-000000000001', 'field-starter', 'Field Starter', 49000, 'monthly', 'USD', true, 50, 200, 'Business hours', '{"analytics":"standard","support":"email"}'::jsonb),
  ('10000000-0000-0000-0000-000000000002', 'network-scale', 'Network Scale', 129000, 'monthly', 'USD', true, 250, 1200, '24/7 NOC', '{"analytics":"advanced","support":"24x7"}'::jsonb),
  ('10000000-0000-0000-0000-000000000003', 'operator-plus', 'Operator Plus', 249000, 'annual', 'USD', true, 1000, 5000, 'Dedicated TAM', '{"analytics":"enterprise","support":"dedicated"}'::jsonb)
on conflict (id) do update
set
  code = excluded.code,
  name = excluded.name,
  price_monthly_cents = excluded.price_monthly_cents,
  billing_interval = excluded.billing_interval,
  currency = excluded.currency,
  is_active = excluded.is_active,
  site_limit = excluded.site_limit,
  base_station_limit = excluded.base_station_limit,
  support_tier = excluded.support_tier,
  feature_summary = excluded.feature_summary;

-- Demo auth user setup:
-- 1. Create a user in Supabase Auth with email/password through the dashboard or auth admin API.
-- 2. Include user metadata:
--    { "full_name": "Demo Admin", "tenant_slug": "oran-demo", "role": "admin" }
-- 3. The auth trigger in 202603141900_auth_profiles_and_policies.sql will create the matching profile row.

insert into public.subscriptions (
  id,
  tenant_id,
  plan_id,
  status,
  seats,
  started_at,
  renews_at,
  current_period_start,
  current_period_end
)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    'active',
    24,
    '2026-01-01',
    '2026-04-01',
    '2026-03-01',
    '2026-03-31'
  )
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  plan_id = excluded.plan_id,
  status = excluded.status,
  seats = excluded.seats,
  started_at = excluded.started_at,
  renews_at = excluded.renews_at,
  current_period_start = excluded.current_period_start,
  current_period_end = excluded.current_period_end;

insert into public.billing_cycles (
  id,
  tenant_id,
  subscription_id,
  cycle_start,
  cycle_end,
  invoice_date,
  due_date,
  status
)
values
  ('21000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '2026-03-01', '2026-03-31', '2026-03-01', '2026-03-18', 'paid'),
  ('21000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '2026-04-01', '2026-04-30', '2026-04-01', '2026-04-18', 'invoiced')
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  subscription_id = excluded.subscription_id,
  cycle_start = excluded.cycle_start,
  cycle_end = excluded.cycle_end,
  invoice_date = excluded.invoice_date,
  due_date = excluded.due_date,
  status = excluded.status;

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
  status,
  description,
  message,
  source_vendor,
  acknowledged,
  acknowledged_at,
  created_at
)
values
  ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000005', 'Battery reserve below threshold', 'critical', 'Power', 'open', 'Battery reserve dropped below the minimum safe threshold during the overnight outage window.', 'Battery voltage under 44V for 18 minutes.', 'Airspan', false, null, '2026-03-14T05:20:00Z'),
  ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'Microwave link packet loss', 'high', 'Backhaul', 'acknowledged', 'Sustained packet loss detected on the ridge backhaul segment.', 'Packet loss crossed 8.2% for 5 minutes.', 'Mavenir', true, '2026-03-14T08:00:00Z', '2026-03-14T07:35:00Z'),
  ('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', 'Sector temperature elevated', 'medium', 'Hardware', 'in_progress', 'Sector enclosure temperature remains above the recommended threshold.', 'Enclosure temperature exceeded 72C.', 'Rakuten Symphony', false, null, '2026-03-14T08:45:00Z'),
  ('50000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', null, 'Generator maintenance overdue', 'low', 'Maintenance', 'resolved', 'Preventive maintenance window exceeded by 6 days.', 'Maintenance schedule breached.', 'Nokia', true, '2026-03-13T19:00:00Z', '2026-03-13T18:15:00Z')
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  site_id = excluded.site_id,
  base_station_id = excluded.base_station_id,
  title = excluded.title,
  severity = excluded.severity,
  category = excluded.category,
  status = excluded.status,
  description = excluded.description,
  message = excluded.message,
  source_vendor = excluded.source_vendor,
  acknowledged = excluded.acknowledged,
  acknowledged_at = excluded.acknowledged_at,
  created_at = excluded.created_at;

insert into public.alarm_events (id, tenant_id, alarm_id, event_type, message, created_at)
values
  ('80000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'created', 'Alarm opened from telemetry ingestion.', '2026-03-14T05:20:00Z'),
  ('80000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', 'acknowledged', 'Alarm acknowledged by the NOC team.', '2026-03-14T08:00:00Z'),
  ('80000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', 'status_changed', 'Alarm moved to in_progress after dispatch.', '2026-03-14T09:10:00Z'),
  ('80000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000004', 'resolved', 'Maintenance completed and alarm resolved.', '2026-03-13T20:00:00Z')
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  alarm_id = excluded.alarm_id,
  event_type = excluded.event_type,
  message = excluded.message,
  created_at = excluded.created_at;

insert into public.alarm_notes (id, tenant_id, alarm_id, body, created_at)
values
  ('90000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Field team requested backup battery load test at first light.', '2026-03-14T06:15:00Z'),
  ('90000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', 'Dispatch technician confirmed fan replacement kit is on the way.', '2026-03-14T09:25:00Z')
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  alarm_id = excluded.alarm_id,
  body = excluded.body,
  created_at = excluded.created_at;

insert into public.invoices (
  id,
  tenant_id,
  subscription_id,
  billing_cycle_id,
  invoice_number,
  account_name,
  issue_date,
  amount_cents,
  subtotal_cents,
  total_cents,
  currency,
  due_date,
  status,
  paid_at
)
values
  ('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000001', 'INV-2026-0301', 'Rural Connect Cooperative', '2026-03-01', 4200000, 4200000, 4200000, 'USD', '2026-03-18', 'paid', '2026-03-05T09:30:00Z'),
  ('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000002', 'INV-2026-0401', 'Village Broadband Cluster A', '2026-04-01', 3180000, 3180000, 3180000, 'USD', '2026-04-18', 'issued', null),
  ('60000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', null, 'INV-2026-0215', 'AgriNet Distribution South', '2026-02-15', 1575000, 1575000, 1575000, 'USD', '2026-03-10', 'overdue', null),
  ('60000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', null, 'INV-2026-0501', 'Community Wireless Program', '2026-05-01', 2790000, 2790000, 2790000, 'USD', '2026-05-28', 'draft', null)
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  subscription_id = excluded.subscription_id,
  billing_cycle_id = excluded.billing_cycle_id,
  invoice_number = excluded.invoice_number,
  account_name = excluded.account_name,
  issue_date = excluded.issue_date,
  amount_cents = excluded.amount_cents,
  subtotal_cents = excluded.subtotal_cents,
  total_cents = excluded.total_cents,
  currency = excluded.currency,
  due_date = excluded.due_date,
  status = excluded.status,
  paid_at = excluded.paid_at;

insert into public.invoice_line_items (
  id,
  tenant_id,
  invoice_id,
  description,
  quantity,
  unit_amount_cents,
  total_amount_cents
)
values
  ('61000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'Network Scale plan - March 2026', 1, 4200000, 4200000),
  ('61000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000002', 'Network Scale plan - April 2026', 1, 3180000, 3180000),
  ('61000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000003', 'Legacy overage adjustment', 1, 1575000, 1575000),
  ('61000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000004', 'Network Scale plan - May 2026', 1, 2790000, 2790000)
on conflict (id) do update
set
  tenant_id = excluded.tenant_id,
  invoice_id = excluded.invoice_id,
  description = excluded.description,
  quantity = excluded.quantity,
  unit_amount_cents = excluded.unit_amount_cents,
  total_amount_cents = excluded.total_amount_cents;

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
