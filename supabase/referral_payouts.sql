-- Run this ONCE in Supabase → SQL Editor → New query → Run.
--
-- Lets an admin mark a referrer as PAID from the Owner Dashboard: it records the
-- payout AND subtracts it from the referrer's balance. A direct profiles update
-- is blocked by the protect_sensitive_profile_columns trigger (referral_balance
-- is a protected payment field), so — like admin_set_premium — we use a
-- SECURITY DEFINER function that verifies the caller is an admin, then presents
-- the change to the guard as the service role.

-- 1) Payout log ------------------------------------------------------------
create table if not exists public.referral_payouts (
  id          uuid primary key default gen_random_uuid(),
  referrer_id uuid references auth.users(id) on delete set null,
  amount      integer not null,        -- kobo, same unit as profiles.referral_balance
  note        text,
  paid_at     timestamptz not null default now()
);
alter table public.referral_payouts enable row level security;
-- Reads happen only through the admin RPC below, so no public policy is needed.

-- 2) Admin marks a referral paid: log it + subtract from the balance --------
create or replace function public.admin_pay_referral(
  target_id   uuid,
  amount_paid integer,
  payout_note text default null
)
returns integer  -- returns the referrer's NEW balance (kobo)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_balance integer;
begin
  -- Only admins may call this (checked with the caller's real JWT).
  if not exists (
    select 1 from public.profiles where id = auth.uid() and is_admin = true
  ) then
    raise exception 'Not authorized: admin only';
  end if;

  insert into public.referral_payouts (referrer_id, amount, note)
  values (target_id, greatest(0, coalesce(amount_paid, 0)), payout_note);

  -- Present this trusted admin change to the sensitive-columns trigger as the
  -- service role (transaction-local), covering both claims paths.
  perform set_config('request.jwt.claims', '{"role":"service_role"}', true);
  perform set_config('request.jwt.claim.role', 'service_role', true);

  update public.profiles
    set referral_balance = greatest(0, coalesce(referral_balance, 0) - greatest(0, coalesce(amount_paid, 0)))
    where id = target_id
    returning referral_balance into new_balance;

  return coalesce(new_balance, 0);
end;
$$;

grant execute on function public.admin_pay_referral(uuid, integer, text) to authenticated;

-- 3) Admin reads the payout log (with the referrer's name) for the dashboard -
create or replace function public.get_referral_payouts(limit_n integer default 20)
returns table (
  id          uuid,
  referrer_id uuid,
  username    text,
  email       text,
  amount      integer,
  note        text,
  paid_at     timestamptz
)
language sql
security definer
set search_path = public
as $$
  select p.id, p.referrer_id, pr.username, pr.email, p.amount, p.note, p.paid_at
  from public.referral_payouts p
  left join public.profiles pr on pr.id = p.referrer_id
  where exists (select 1 from public.profiles a where a.id = auth.uid() and a.is_admin = true)
  order by p.paid_at desc
  limit limit_n;
$$;

grant execute on function public.get_referral_payouts(integer) to authenticated;
