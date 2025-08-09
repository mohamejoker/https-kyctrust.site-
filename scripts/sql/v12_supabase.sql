-- Supabase-ready schema, RLS, indexes, and RPC helpers. Idempotent.

-- SETTINGS
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;

-- USERS
create table if not exists public.users (
  id bigserial primary key,
  name text not null,
  email text unique not null,
  role text not null check (role in ('admin','editor','viewer')) default 'editor',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.users enable row level security;

-- ANALYTICS
create table if not exists public.analytics_daily (
  day date primary key,
  visitors int not null,
  leads int not null,
  orders int not null,
  conversion_rate numeric(5,2) not null
);
alter table public.analytics_daily enable row level security;

-- SNAPSHOTS
create table if not exists public.content_snapshots (
  id bigserial primary key,
  locale text not null check (locale in ('ar','en')),
  content jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.content_snapshots enable row level security;
create index if not exists idx_content_snapshots_created on public.content_snapshots (created_at desc);
create index if not exists idx_content_snapshots_locale_created on public.content_snapshots (locale, created_at desc);

-- RATE LIMITS
create table if not exists public.rate_limits (
  key text not null,
  ts timestamptz not null
);
alter table public.rate_limits enable row level security;
create index if not exists idx_rate_limits_key_ts on public.rate_limits (key, ts desc);

-- REVIEWS
create table if not exists public.reviews (
  id bigserial primary key,
  name text not null,
  email text,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  status text not null check (status in ('pending','approved','rejected')) default 'pending',
  ip_hash text,
  ua_hash text,
  created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;
create index if not exists idx_reviews_status_created on public.reviews (status, created_at desc);
create index if not exists idx_reviews_rating on public.reviews (rating);

-- BASIC POLICIES
-- Anonymous public read of published content only
drop policy if exists p_settings_public_read on public.settings;
create policy p_settings_public_read on public.settings
for select using (key = 'published_content');

-- Authenticated full access to settings (adjust as needed)
drop policy if exists p_settings_auth_all on public.settings;
create policy p_settings_auth_all on public.settings
as permissive
for all
to authenticated
using (true)
with check (true);

-- Reviews: anyone can insert a review (pending)
drop policy if exists p_reviews_insert_any on public.reviews;
create policy p_reviews_insert_any on public.reviews
for insert
to anon, authenticated
with check (true);

-- Reviews: public can read approved only
drop policy if exists p_reviews_read_approved on public.reviews;
create policy p_reviews_read_approved on public.reviews
for select
to anon, authenticated
using (status = 'approved');

-- Reviews: authenticated can read all (moderation UI)
drop policy if exists p_reviews_read_all_auth on public.reviews;
create policy p_reviews_read_all_auth on public.reviews
for select
to authenticated
using (true);

-- Snapshots: authenticated full access
drop policy if exists p_snapshots_auth_all on public.content_snapshots;
create policy p_snapshots_auth_all on public.content_snapshots
for all
to authenticated
using (true)
with check (true);

-- Users: authenticated read; update restricted to authenticated
drop policy if exists p_users_select_auth on public.users;
create policy p_users_select_auth on public.users
for select
to authenticated
using (true);

drop policy if exists p_users_mutate_auth on public.users;
create policy p_users_mutate_auth on public.users
for insert, update, delete
to authenticated
using (true)
with check (true);

-- Analytics: public read (optional), or restrict to authenticated
drop policy if exists p_analytics_read on public.analytics_daily;
create policy p_analytics_read on public.analytics_daily
for select to anon, authenticated using (true);

-- RPC HELPERS
-- Get published content
create or replace function public.rpc_get_published()
returns jsonb
language sql
stable
as $$
  select value from public.settings where key = 'published_content' limit 1
$$;

-- Publish content atomically and snapshot
create or replace function public.rpc_publish_content(payload jsonb)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.settings (key, value)
  values ('published_content', payload)
  on conflict (key) do update set value = excluded.value, updated_at = now();

  if (payload ? 'ar') then
    insert into public.content_snapshots (locale, content) values ('ar', payload->'ar');
  end if;
  if (payload ? 'en') then
    insert into public.content_snapshots (locale, content) values ('en', payload->'en');
  end if;
end;
$$;

-- Moderate a review
create or replace function public.rpc_moderate_review(rid bigint, new_status text)
returns void
language plpgsql
security definer
as $$
begin
  if new_status not in ('approved','rejected') then
    raise exception 'bad status';
  end if;
  update public.reviews set status = new_status where id = rid;
end;
$$;
