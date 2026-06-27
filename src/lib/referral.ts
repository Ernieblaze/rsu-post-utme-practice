const PENDING_REF_KEY = 'rsu_pending_ref_code';
const JUST_SIGNED_UP_KEY = 'rsu_just_signed_up';

/** Call once on app load. If the URL has ?ref=CODE, remember it for signup attribution. */
export function captureReferralFromUrl(): void {
  if (typeof window === 'undefined') return;
  const code = new URLSearchParams(window.location.search).get('ref');
  if (code && code.trim()) {
    localStorage.setItem(PENDING_REF_KEY, code.trim().toUpperCase());
  }
}

export function getPendingReferralCode(): string | null {
  return localStorage.getItem(PENDING_REF_KEY);
}

export function markJustSignedUp(): void {
  localStorage.setItem(JUST_SIGNED_UP_KEY, '1');
}

export function consumeJustSignedUpFlag(): boolean {
  const flag = localStorage.getItem(JUST_SIGNED_UP_KEY) === '1';
  localStorage.removeItem(JUST_SIGNED_UP_KEY);
  localStorage.removeItem(PENDING_REF_KEY);
  return flag;
}

/** Generate a short, shareable referral code from an email. Not guaranteed unique by itself. */
export function generateReferralCode(email: string): string {
  const prefix = email
    .split('@')[0]
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 6)
    .toUpperCase() || 'USER';
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}${suffix}`;
}

export function buildReferralLink(code: string): string {
  if (typeof window === 'undefined') return code;
  return `${window.location.origin}/?ref=${code}`;
}
