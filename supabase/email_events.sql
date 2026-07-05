-- Run this ONCE in Supabase → SQL Editor → Run.
-- Logs every email that counts toward the daily send cap (signup confirmations,
-- resent confirmations, password resets) so the Owner Dashboard's "Daily Email
-- Quota" meter is accurate — not just signups.

-- 1) The event log (tiny rows: id, time, type).
create table if not exists public.email_events (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  type        text not null   -- 'signup' | 'resend' | 'reset'
);

create index if not exists email_events_created_at_idx on public.email_events (created_at);

-- 2) RLS: anyone (even logged-out — signup/reset happen while logged out) can
--    log an event; nobody reads raw rows (stats come from the admin function).
alter table public.email_events enable row level security;

drop policy if exists "anyone can log an email event" on public.email_events;
create policy "anyone can log an email event"
  on public.email_events for insert
  to anon, authenticated
  with check (true);

-- 3) Admin-only totals for TODAY (since midnight, server time).
create or replace function public.get_email_usage_today()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
  day_start timestamptz := date_trunc('day', now());
begin
  if not exists (
    select 1 from public.profiles where id = auth.uid() and is_admin = true
  ) then
    raise exception 'Not authorized: admin only';
  end if;

  select json_build_object(
    'total',  (select count(*) from email_events where created_at >= day_start),
    'signup', (select count(*) from email_events where type = 'signup' and created_at >= day_start),
    'resend', (select count(*) from email_events where type = 'resend' and created_at >= day_start),
    'reset',  (select count(*) from email_events where type = 'reset'  and created_at >= day_start)
  ) into result;

  return result;
end;
$$;

grant execute on function public.get_email_usage_today() to authenticated;

-- Optional housekeeping (keep the table tiny):
--   delete from public.email_events where created_at < now() - interval '30 days';
