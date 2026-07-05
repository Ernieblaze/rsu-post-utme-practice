/**
 * Single source of truth for the RSU Post-UTME exam date, so the countdown is
 * consistent everywhere (landing page, home study plan, etc.).
 */
export const EXAM_DATE = new Date('2026-07-21T08:00:00+01:00');

/** Whole calendar days from `now` until exam day (0 once it's here/past). */
export function daysUntilExam(now: Date = new Date()): number {
  const examDay = new Date(EXAM_DATE.getFullYear(), EXAM_DATE.getMonth(), EXAM_DATE.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((examDay.getTime() - today.getTime()) / 86_400_000));
}
