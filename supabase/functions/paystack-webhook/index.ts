/**
 * Paystack Webhook — Supabase Edge Function
 *
 * Paystack calls this URL the moment any payment succeeds.
 * It verifies the request is genuinely from Paystack (HMAC-SHA512
 * signature check), then marks the paying student as Premium in the
 * Supabase profiles table (has_paid = true, paid_until = now + 1 year).
 *
 * Required Supabase secrets (set once via CLI or dashboard):
 *   PAYSTACK_SECRET_KEY  — your Paystack secret key (sk_live_... or sk_test_...)
 *
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically
 * by Supabase into every Edge Function — you do not set them manually.
 *
 * Webhook URL to register in Paystack dashboard:
 *   https://wqouknqvuqaaxqsevkxs.supabase.co/functions/v1/paystack-webhook
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// ── Environment ──────────────────────────────────────────────────────────────
const PAYSTACK_SECRET   = Deno.env.get('PAYSTACK_SECRET_KEY') ?? '';
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SVC_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// ── HMAC-SHA512 helper ───────────────────────────────────────────────────────
async function computeHmac(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ── Main handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const rawBody  = await req.text();
  const incoming = req.headers.get('x-paystack-signature') ?? '';

  // 1. Reject anything that didn't come from Paystack
  const expected = await computeHmac(PAYSTACK_SECRET, rawBody);
  if (expected !== incoming) {
    console.error('Webhook signature mismatch — request rejected');
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Parse the event
  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  // 3. Ignore everything except a successful charge
  if (event.event !== 'charge.success') {
    return new Response('OK — event ignored', { status: 200 });
  }

  // 4. Pull the Supabase user ID we embedded in metadata at payment time
  const data = event.data as {
    reference?: string;
    amount?: number;
    metadata?: { user_id?: string };
    customer?: { email?: string };
  };

  const userId = data.metadata?.user_id;
  if (!userId) {
    console.error('charge.success with no metadata.user_id — cannot update profile');
    return new Response('Missing user_id in metadata', { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SVC_KEY);

  // 5. Read the buyer's current state BEFORE updating. This lets us tell a
  //    first-time purchase apart from a renewal or a duplicate webhook, so
  //    the referral commission is only ever paid once.
  const { data: buyer } = await supabase
    .from('profiles')
    .select('referred_by, paid_until')
    .eq('id', userId)
    .single();

  const wasAlreadyActive =
    !!buyer?.paid_until && new Date(buyer.paid_until).getTime() > Date.now();

  // 6. Mark the student as Premium for one full year
  const paidUntil = new Date();
  paidUntil.setFullYear(paidUntil.getFullYear() + 1);

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({
      has_paid:   true,
      paid_until: paidUntil.toISOString(),
    })
    .eq('id', userId);

  if (updateErr) {
    console.error('Profile update failed:', updateErr.message);
    return new Response('Database error', { status: 500 });
  }

  console.log(
    `✓ Premium activated | user=${userId} | ref=${data.reference} | until=${paidUntil.toISOString()}`,
  );

  // 7. Referral commission — pay 25% to the referrer, but ONLY on a genuine
  //    first purchase (not renewals, and not duplicate webhook deliveries).
  if (buyer?.referred_by && !wasAlreadyActive) {
    const commission = Math.round((data.amount ?? 0) * 0.25);
    const { data: referrer } = await supabase
      .from('profiles')
      .select('referral_balance')
      .eq('id', buyer.referred_by)
      .single();

    if (referrer !== null) {
      await supabase
        .from('profiles')
        .update({ referral_balance: (referrer.referral_balance ?? 0) + commission })
        .eq('id', buyer.referred_by);

      console.log(`✓ Referral commission ₦${commission / 100} credited to ${buyer.referred_by}`);
    }
  }

  return new Response('OK', { status: 200 });
});
