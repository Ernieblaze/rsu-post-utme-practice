/**
 * Free-trial question quota.
 *
 * A non-premium student may answer at most FREE_QUESTION_LIMIT questions in
 * total (across all tests) before the paywall blocks them. The count is
 * stored in localStorage keyed by the user's ID, so it survives page
 * refreshes and logging out/in on the same account. Paying (premium) removes
 * the limit entirely — this module is only consulted for non-premium users.
 *
 * Note: this is browser-local. Clearing browser storage resets it, which is
 * an accepted trade-off (no extra database column required). Premium status
 * itself is always confirmed server-side via Supabase + the Paystack webhook.
 */

export const FREE_QUESTION_LIMIT = 4;

function key(userId: string): string {
  return `rsu_free_q_${userId}`;
}

/** How many free questions this user has already answered (0 if unknown). */
export function getFreeQuestionsUsed(userId: string | null | undefined): number {
  if (!userId) return 0;
  try {
    const raw = localStorage.getItem(key(userId));
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

/** Persist the exact number of free questions used. */
export function setFreeQuestionsUsed(userId: string, n: number): void {
  try {
    localStorage.setItem(key(userId), String(Math.max(0, n)));
  } catch {
    /* ignore */
  }
}

/** Record one more answered free question; returns the new total. */
export function incrementFreeQuestions(userId: string): number {
  const next = getFreeQuestionsUsed(userId) + 1;
  setFreeQuestionsUsed(userId, next);
  return next;
}

/** How many free questions remain (0 once the trial is used up). */
export function freeQuestionsRemaining(userId: string | null | undefined): number {
  return Math.max(0, FREE_QUESTION_LIMIT - getFreeQuestionsUsed(userId));
}
