-- Momora production data model.
-- Apply in Supabase SQL editor or via Supabase CLI after reviewing.

create table if not exists public.momora_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'mother' check (role in ('mother', 'father', 'caregiver')),
  partner_name text,
  partner_user_id uuid references auth.users(id) on delete set null,
  invite_code text unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  baby_name text,
  baby_gender text,
  journey_mode text not null default 'pregnancy' check (journey_mode in ('pregnancy', 'postpartum', 'baby')),
  due_date date,
  birth_date date,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.momora_state_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sync_version integer not null default 1,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.momora_tracking_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  occurred_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.momora_family_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete cascade,
  message_type text not null default 'partner_note',
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists momora_tracking_events_user_type_time_idx
  on public.momora_tracking_events (user_id, event_type, occurred_at desc);

create index if not exists momora_family_messages_recipient_time_idx
  on public.momora_family_messages (recipient_id, created_at desc);

alter table public.momora_profiles enable row level security;
alter table public.momora_state_snapshots enable row level security;
alter table public.momora_tracking_events enable row level security;
alter table public.momora_family_messages enable row level security;

grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.momora_profiles,
  public.momora_state_snapshots,
  public.momora_tracking_events,
  public.momora_family_messages
to authenticated;

drop policy if exists "profiles select own or partner" on public.momora_profiles;
create policy "profiles select own or partner"
on public.momora_profiles
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or (select auth.uid()) = partner_user_id
);

drop policy if exists "profiles insert own" on public.momora_profiles;
create policy "profiles insert own"
on public.momora_profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "profiles update own" on public.momora_profiles;
create policy "profiles update own"
on public.momora_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "state select own" on public.momora_state_snapshots;
create policy "state select own"
on public.momora_state_snapshots
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "state insert own" on public.momora_state_snapshots;
create policy "state insert own"
on public.momora_state_snapshots
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "state update own" on public.momora_state_snapshots;
create policy "state update own"
on public.momora_state_snapshots
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "tracking select own" on public.momora_tracking_events;
create policy "tracking select own"
on public.momora_tracking_events
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "tracking insert own" on public.momora_tracking_events;
create policy "tracking insert own"
on public.momora_tracking_events
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "tracking update own" on public.momora_tracking_events;
create policy "tracking update own"
on public.momora_tracking_events
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "tracking delete own" on public.momora_tracking_events;
create policy "tracking delete own"
on public.momora_tracking_events
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "messages select sender or recipient" on public.momora_family_messages;
create policy "messages select sender or recipient"
on public.momora_family_messages
for select
to authenticated
using (
  (select auth.uid()) = sender_id
  or (select auth.uid()) = recipient_id
);

drop policy if exists "messages insert sender" on public.momora_family_messages;
create policy "messages insert sender"
on public.momora_family_messages
for insert
to authenticated
with check ((select auth.uid()) = sender_id);
