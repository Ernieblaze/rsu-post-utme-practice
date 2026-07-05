import { supabase } from './supabaseClient';

/**
 * Logs every action that causes an email to be sent (and therefore counts
 * toward the daily email cap): new-signup confirmations, resent confirmations,
 * and password-reset emails. The Owner Dashboard sums these for the day so the
 * "Daily Email Quota" meter reflects ALL emails, not just signups.
 *
 * Fire-and-forget — must never block or break auth.
 */
export type EmailEventType = 'signup' | 'resend' | 'reset';

export function logEmailEvent(type: EmailEventType): void {
  void supabase
    .from('email_events')
    .insert({ type })
    .then(
      () => {},
      () => {},
    );
}
