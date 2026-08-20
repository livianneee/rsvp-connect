-- =============================================================================
-- GlobalTix Connect RSVP — Supabase setup
-- Run this in your Supabase project: SQL Editor → New query → paste → Run.
-- =============================================================================

-- 1) Table -------------------------------------------------------------------
create table if not exists public.rsvps (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  response   text not null check (response in ('yes', 'no')),
  pax        integer not null default 1,
  note       text default '',
  edition    text default 'singapore',
  created_at timestamptz not null default now()
);

-- 2) Row Level Security ------------------------------------------------------
-- With RLS on, NOTHING is allowed unless a policy explicitly permits it.
alter table public.rsvps enable row level security;

-- 3a) Allow guests (the public/anon key) to SUBMIT an RSVP -------------------
create policy "public can insert rsvp"
  on public.rsvps
  for insert
  to anon
  with check (true);

-- 3b) Allow the in-app admin view (?admin=1) to READ responses ---------------
--     WARNING: the anon key ships in the browser, so this makes every response
--     readable by anyone who has your site URL + inspects the key. The passcode
--     screen does NOT protect this. Only enable if guest names are not sensitive.
--     If you prefer to keep responses private, DELETE this policy and instead
--     view/export responses in the Supabase dashboard (Table Editor), or move
--     the admin behind Supabase Auth.
create policy "public can read rsvp"
  on public.rsvps
  for select
  to anon
  using (true);

-- Note: no UPDATE or DELETE policies are created, so responses cannot be edited
-- or deleted from the browser. Manage those in the Supabase dashboard.
