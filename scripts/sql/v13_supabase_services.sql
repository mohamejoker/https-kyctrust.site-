-- Services and Interactions schema for Supabase. Idempotent and RLS-ready.

-- SERVICES TABLE
create table if not exists public.services (
  id bigserial primary key,
  name text not null,
  category text not null,
  price text not null,
  description text not null,
  note text,
  icon_image text,
  active boolean not null default true,
  popular boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.services enable row level security;

-- Indexes for performance
create index if not exists idx_services_active_sort on public.services (active, sort asc);
create index if not exists idx_services_category on public.services (category);

-- RLS Policies:
-- 1) Public can read only active services
drop policy if exists p_services_public_read on public.services;
create policy p_services_public_read on public.services
for select
to anon, authenticated
using (active = true);

-- 2) Authenticated can do everything (adjust to roles later)
drop policy if exists p_services_auth_all on public.services;
create policy p_services_auth_all on public.services
for all
to authenticated
using (true)
with check (true);

-- INTERACTIONS TABLE (leads, contact, orders)
create table if not exists public.interactions (
  id bigserial primary key,
  kind text not null check (kind in ('contact','order','review','other')),
  meta jsonb,
  created_at timestamptz not null default now()
);
alter table public.interactions enable row level security;

-- Allow public inserts (e.g., contact form) but no reads
drop policy if exists p_interactions_public_insert on public.interactions;
create policy p_interactions_public_insert on public.interactions
for insert to anon, authenticated with check (true);

-- Allow authenticated read/write
drop policy if exists p_interactions_auth_all on public.interactions;
create policy p_interactions_auth_all on public.interactions
for all to authenticated using (true) with check (true);

-- OPTIONAL: Seed a few services (remove or adapt as needed)
insert into public.services (name, category, price, description, note, icon_image, active, popular, sort)
select * from (values
  ('PayPal', 'Wallet', '$', 'Secure online checkout and transfers.', null, '/images/logos/paypal.png', true, true, 1),
  ('Payoneer', 'Banking', '$$', 'Receive and manage international payments.', null, '/images/logos/payoneer.png', true, false, 2),
  ('Wise', 'Banking', '$', 'Low-fee international transfers.', 'Fast KYC', '/images/logos/wise.png', true, false, 3)
) as v(name, category, price, description, note, icon_image, active, popular, sort)
where not exists (select 1 from public.services);
