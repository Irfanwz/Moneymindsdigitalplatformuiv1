-- Payments table for tracking group and training payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.platform_users(id),
  item_type text not null check (item_type in ('group_join', 'group_monthly', 'training')),
  item_id text not null,
  amount numeric(10,2) not null default 0,
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  payment_method text default 'card',
  transaction_ref text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_payments_user on public.payments(user_id);
create index if not exists idx_payments_item on public.payments(item_type, item_id);
