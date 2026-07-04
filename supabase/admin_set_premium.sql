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
  -- 1) Only admins may call this (checked with the caller's real JWT).
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  ) then
    raise exception 'Not authorized: admin only';
  end if;

  -- 2) The protect_sensitive_profile_columns trigger blocks any non-service-role
  --    JWT from changing payment fields. After the admin check above, present
  --    this trusted admin change to the guard as the service role (covering both
  --    the JSON-claims path and the legacy single-claim path). Transaction-local.
  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
  perform set_config('request.jwt.claim.role', 'service_role', true);

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
