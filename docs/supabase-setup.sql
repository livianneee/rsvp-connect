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
  slug       text default '',          -- per-invite-link key (e.g. "jane-doe")
  created_at timestamptz not null default now()
);
 
-- One RSVP per invite link: a unique slug prevents duplicate rows. Partial index
-- so multiple blank slugs (generic link, no name) don't collide with each other.
create unique index if not exists rsvps_slug_unique
  on public.rsvps (slug)
  where slug <> '';
 
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
 
-- 3c) Allow guests to CHANGE their response once ----------------------------
--     Needed for the "change my response (once)" flow. Guests can update the
--     row for their own invite link (matched by slug). No DELETE policy exists,
--     so rows can't be removed from the browser.
--     Tradeoff: anon UPDATE means someone who knows another guest's slug could
--     overwrite that guest's answer. Fine for a private invite list; if you'd
--     rather guests could NOT change their answer at all, delete this policy and
--     the app will simply block repeat submits instead.
create policy "public can update own rsvp by slug"
  on public.rsvps
  for update
  to anon
  using (slug <> '')
  with check (slug <> '');
 
-- Note: no DELETE policy is created, so responses cannot be deleted from the
-- browser. Manage deletions in the Supabase dashboard.
 
-- 3d) Let a guest check ONLY their own link's status on page load -----------
--     Reads are locked to organizers (3b), but the invitation page needs to know
--     whether *this* link already responded. This security-definer function
--     returns just the row for the given slug — the public anon key can call it
--     but still cannot list everyone's responses.
create or replace function public.get_rsvp_status(p_slug text)
  returns table (name text, response text)
  language sql
  security definer
  set search_path = public
as $$
  select name, response
  from public.rsvps
  where slug = p_slug
  limit 1;
$$;
 
grant execute on function public.get_rsvp_status(text) to anon, authenticated;
 
-- 4) Create the organizer account & lock down sign-ups -----------------------
--    a. Authentication → Users → "Add user" → set your email + a password.
--       (This is the account you'll use at /?admin=1.)
--    b. Authentication → Providers → Email: turn OFF "Allow new users to sign up"
--       (a.k.a. disable public sign-ups) so only accounts you create can log in.
--    The app only ever calls sign-in (never sign-up), so no one can self-register.