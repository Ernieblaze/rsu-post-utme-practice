/**
 * Study streak — counts consecutive days the student practised, to build a
 * daily habit in the run-up to the exam. Device-local (matches how attempts are
 * stored) and purely client-side; call `recordStudyDay()` on any real study
 * action (finishing a test, answering the daily question).
 */
const KEY = 'rsu_study_days';

function dayStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getStudyDays(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Mark today as a study day (idempotent). */
export function recordStudyDay(now: Date = new Date()): void {
  try {
    const today = dayStr(now);
    const days = getStudyDays();
    if (!days.includes(today)) {
      days.push(today);
      localStorage.setItem(KEY, JSON.stringify(days.slice(-400))); // cap history
    }
  } catch {
    /* storage full/blocked — a streak is non-essential */
  }
}

/**
 * Current streak = consecutive days with study activity, ending today (or
 * yesterday, so an unfinished today doesn't break it). Extra `extraDates` (e.g.
 * dates from existing attempts) are merged in so past practice counts too.
 */
export function getStreak(extraDates: string[] = [], now: Date = new Date()): number {
  const set = new Set(getStudyDays());
  extraDates.forEach((iso) => {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) set.add(dayStr(d));
  });
  if (set.size === 0) return 0;

  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const has = () => set.has(dayStr(cursor));
  // Allow the streak to be anchored to yesterday if nothing done yet today.
  if (!has()) {
    cursor.setDate(cursor.getDate() - 1);
    if (!has()) return 0;
  }
  let streak = 0;
  while (has()) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
