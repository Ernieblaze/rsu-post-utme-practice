-- Run this ONCE in Supabase → SQL Editor → New query → Run.
--
-- It lets an admin (a profile with is_admin = true) grant or revoke Premium
-- for ANY user from the Owner Dashboard. Direct table updates are blocked by
-- row-level security, so we use a SECURITY DEFINER function that runs with
-- elevated rights but first checks the caller is actually an admin.

create or replace function public.admin_set_premium(target_id uuid, make_premium boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only admins may call this.
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  ) then
    raise exception 'Not authorized: admin only';
  end if;

  if make_premium then
    update public.profiles
      set has_paid = true,
          paid_until = (now() + interval '1 year')
      where id = target_id;
  else
    update public.profiles
      set has_paid = false,
          paid_until = null
      where id = target_id;
  end if;
end;
$$;

grant execute on function public.admin_set_premium(uuid, boolean) to authenticated;
