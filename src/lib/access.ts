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

export function isSubscriptionActive(profile: Profile | null): boolean {
  if (!profile) return false;
  if (!profile.paid_until) return false;
  const expiry = new Date(profile.paid_until).getTime();
  return Number.isFinite(expiry) && expiry > Date.now();
}

export function getAccessStatus(profile: Profile | null): AccessStatus {
  if (!profile) return 'locked';
  if (profile.is_admin) return 'admin';
  if (isSubscriptionActive(profile)) return 'paid';
  if (!profile.free_test_used) return 'free-available';
  return 'locked';
}

export function canStartTest(profile: Profile | null): boolean {
  const status = getAccessStatus(profile);
  return status === 'admin' || status === 'paid' || status === 'free-available';
}
