export interface Profile {
  id: string;
  email: string | null;
  has_paid: boolean;
  paid_until: string | null;
  free_test_used: boolean;
  is_admin: boolean;
  referral_code: string | null;
  referred_by: string | null;
  referral_balance: number;
}

export type AccessStatus = 'admin' | 'paid' | 'free-available' | 'locked';

// Stores the ID of the user who just paid, so the flag can never grant
// premium to a DIFFERENT user (or a logged-out visitor) on a shared device.
const LS_PREMIUM_USER_KEY = 'isPremiumUserId';

/** Set by the Paystack success callback — grants instant access without waiting for the webhook. */
export function setPremiumLocally(userId: string): void {
  try { localStorage.setItem(LS_PREMIUM_USER_KEY, userId); } catch { /* ignore */ }
}

/** Call on sign-out so the flag doesn't bleed into a different account. */
export function clearPremiumLocally(): void {
  try { localStorage.removeItem(LS_PREMIUM_USER_KEY); } catch { /* ignore */ }
}

/** True only when the stored ID matches the currently signed-in user. */
export function isPremiumLocally(userId: string | null | undefined): boolean {
  if (!userId) return false;
  try { return localStorage.getItem(LS_PREMIUM_USER_KEY) === userId; } catch { return false; }
}

export function isSubscriptionActive(profile: Profile | null): boolean {
  if (!profile) return false;
  if (!profile.paid_until) return false;
  const expiry = new Date(profile.paid_until).getTime();
  return Number.isFinite(expiry) && expiry > Date.now();
}

export function getAccessStatus(profile: Profile | null): AccessStatus {
  if (profile?.is_admin) return 'admin';
  // Supabase-confirmed subscription (set by the Paystack webhook) — source of truth.
  if (isSubscriptionActive(profile)) return 'paid';
  // localStorage fast-path: set immediately on Paystack success so results
  // unlock the moment payment confirms, even if the webhook is slightly delayed.
  // Scoped to this exact user so it can't grant free access to anyone else.
  if (isPremiumLocally(profile?.id)) return 'paid';
  if (!profile) return 'locked';
  if (!profile.free_test_used) return 'free-available';
  return 'locked';
}

export function canStartTest(profile: Profile | null): boolean {
  const status = getAccessStatus(profile);
  return status === 'admin' || status === 'paid' || status === 'free-available';
}
