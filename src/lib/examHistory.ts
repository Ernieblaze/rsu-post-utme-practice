/**
 * Tracks which bank questions a student has already seen in past Exam Focus
 * attempts, so each new mock exam serves fresh questions first (they won't
 * keep repeating the same ones until the pool is exhausted).
 *
 * Stored in localStorage keyed by user ID. Browser-local by design — no
 * database column needed, and repeats are only cosmetic if it ever resets.
 */

function key(userId: string): string {
  return `rsu_seen_q_${userId}`;
}

/** Set of bank question IDs the user has already been shown in past exams. */
export function getSeenQuestionIds(userId: string | null | undefined): Set<string> {
  if (!userId) return new Set();
  try {
    const raw = localStorage.getItem(key(userId));
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

/** Add the question IDs used in the exam just built to the user's seen list. */
export function recordSeenQuestionIds(userId: string | null | undefined, ids: string[]): void {
  if (!userId || ids.length === 0) return;
  try {
    const seen = getSeenQuestionIds(userId);
    ids.forEach((id) => seen.add(id));
    localStorage.setItem(key(userId), JSON.stringify([...seen]));
  } catch {
    /* ignore */
  }
}
