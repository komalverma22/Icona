-- Run once in the Supabase SQL editor (Dashboard > SQL Editor) before wiring up checkout.
-- Tracks sponsorship subscriptions created through Dodo Payments.

create table if not exists public.sponsorships (
  dodo_subscription_id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  tier text not null,
  dodo_customer_id text not null,
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sponsorships_user_id_idx on public.sponsorships (user_id);

alter table public.sponsorships enable row level security;

-- Users can read their own sponsorship rows. All writes go through the
-- service-role client (the webhook handler), which bypasses RLS.
create policy "Users can view their own sponsorships" on public.sponsorships
  for select
  using (auth.uid() = user_id);
