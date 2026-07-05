-- Run this ONCE in Supabase → SQL Editor → Run.
-- Sets up anonymous website-visit logging + an admin-only stats function that
-- powers the "Website Traffic" section on the Owner Dashboard.

-- 1) The visits table (tiny rows: id, time, visitor, path, source).
create table if not exists public.site_visits (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  visitor_id  text,
  path        text,
  source      text
);

-- Helpful index for the time-window counts.
create index if not exists site_visits_created_at_idx on public.site_visits (created_at);

-- 2) Row-level security: anyone (even logged-out visitors) may INSERT a visit,
--    but NOBODY can read the raw rows directly — stats only come from the
--    admin-only function below.
alter table public.site_visits enable row level security;

drop policy if exists "anyone can log a visit" on public.site_visits;
create policy "anyone can log a visit"
  on public.site_visits for insert
  to anon, authenticated
  with check (true);

-- 3) Admin-only aggregated stats (SECURITY DEFINER bypasses RLS to read).
create or replace function public.get_visit_stats()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  if not exists (
    select 1 from public.profiles where id = auth.uid() and is_admin = true
  ) then
    raise exception 'Not authorized: admin only';
  end if;

  select json_build_object(
    'lastHour',     (select count(distinct visitor_id) from site_visits where created_at >= now() - interval '1 hour'),
    'last12h',      (select count(distinct visitor_id) from site_visits where created_at >= now() - interval '12 hours'),
    'last24h',      (select count(distinct visitor_id) from site_visits where created_at >= now() - interval '24 hours'),
    'pageviews24h', (select count(*)                   from site_visits where created_at >= now() - interval '24 hours'),
    'sources',      (select coalesce(json_agg(t), '[]'::json) from (
                       select coalesce(nullif(source, ''), 'direct') as source,
                              count(distinct visitor_id) as visitors
                       from site_visits
                       where created_at >= now() - interval '24 hours'
                       group by 1
                       order by 2 desc
                       limit 8
                     ) t)
  ) into result;

  return result;
end;
$$;

grant execute on function public.get_visit_stats() to authenticated;

-- Optional housekeeping: delete visits older than 30 days to keep storage small.
-- Run occasionally, or set up a scheduled job:
--   delete from public.site_visits where created_at < now() - interval '30 days';
