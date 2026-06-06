-- ============================================================
-- Migration: Add notifications, connections, platform_settings
-- and photo_url columns to profile tables
-- Run this on an EXISTING database that already has the base schema
-- ============================================================

-- 1. Add photo_url to all profile tables
-- ============================================================

alter table public.startup_profiles
  add column if not exists photo_url text;

alter table public.investor_profiles
  add column if not exists photo_url text;

alter table public.advisor_profiles
  add column if not exists photo_url text;

-- 2. Notifications table
-- ============================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.platform_users(id) on delete cascade,
  title text not null,
  message text not null default '',
  type text not null default 'info' check (type in ('info', 'success', 'warning')),
  read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_user_read on public.notifications(user_id, read);

-- 3. Connections table
-- ============================================================

create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.platform_users(id) on delete cascade,
  to_user_id uuid not null references public.platform_users(id) on delete cascade,
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(from_user_id, to_user_id)
);

create or replace function public.set_connections_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = timezone('utc', now()); return new; end; $$;

drop trigger if exists set_connections_updated_at on public.connections;
create trigger set_connections_updated_at
before update on public.connections
for each row execute function public.set_connections_updated_at();

create index if not exists idx_connections_from_user on public.connections(from_user_id);
create index if not exists idx_connections_to_user on public.connections(to_user_id);

-- 4. Platform Settings table (admin-configurable)
-- ============================================================

create table if not exists public.platform_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null default '',
  updated_by uuid references public.platform_users(id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now())
);

-- Seed default settings
insert into public.platform_settings (key, value) values
  ('public_registration', 'true'),
  ('auto_approve_users', 'false'),
  ('require_verification', 'true'),
  ('email_notifications', 'true'),
  ('maintenance_mode', 'false')
on conflict (key) do nothing;
