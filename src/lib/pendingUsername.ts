/**
 * Holds a display name chosen at sign-up until the user first logs in (a new
 * account isn't authenticated yet, so we can't write to their profile row
 * immediately — same pattern as the referral code). AuthContext consumes it on
 * first login and saves it to profiles.username.
 */
const KEY = 'rsu_pending_username';

export function setPendingUsername(name: string): void {
  try {
    const clean = name.trim().slice(0, 30);
    if (clean) localStorage.setItem(KEY, clean);
  } catch {
    /* ignore */
  }
}

export function consumePendingUsername(): string | null {
  try {
    const v = localStorage.getItem(KEY);
    if (v) localStorage.removeItem(KEY);
    return v;
  } catch {
    return null;
  }
}
