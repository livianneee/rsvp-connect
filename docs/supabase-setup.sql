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

-- 3b) Allow ONLY signed-in organizers to READ responses ---------------------
--     Reads are restricted to authenticated users, so the public anon key can
--     submit but cannot list responses. The in-app ?admin=1 view signs in via
--     Supabase Auth (see step 4) to read this table.
create policy "authenticated can read rsvp"
  on public.rsvps
  for select
  to authenticated
  using (true);

-- Note: no UPDATE or DELETE policies are created, so responses cannot be edited
-- or deleted from the browser. Manage those in the Supabase dashboard.

-- 4) Create the organizer account & lock down sign-ups -----------------------
--    a. Authentication → Users → "Add user" → set your email + a password.
--       (This is the account you'll use at /?admin=1.)
--    b. Authentication → Providers → Email: turn OFF "Allow new users to sign up"
--       (a.k.a. disable public sign-ups) so only accounts you create can log in.
--    The app only ever calls sign-in (never sign-up), so no one can self-register.
