/**
 * Turns a student's past attempts into a "what to study next" signal by
 * aggregating their per-subject accuracy across every attempt. Used by the
 * home Study Plan to point them at their weakest area.
 */
import type { Attempt } from '../types';

export interface SubjectStat {
  subject: string;
  correct: number;
  total: number;
  accuracy: number; // 0..1
}

export function subjectStats(attempts: Attempt[]): SubjectStat[] {
  const map = new Map<string, { correct: number; total: number }>();
  attempts.forEach((a) =>
    a.subjectBreakdown.forEach((s) => {
      const cur = map.get(s.subject) ?? { correct: 0, total: 0 };
      cur.correct += s.correct;
      cur.total += s.total;
      map.set(s.subject, cur);
    })
  );
  return Array.from(map.entries()).map(([subject, { correct, total }]) => ({
    subject,
    correct,
    total,
    accuracy: total > 0 ? correct / total : 0,
  }));
}

/**
 * The subject the student is weakest at. Prefers subjects with at least
 * `minAnswered` questions answered (so one unlucky question doesn't dominate);
 * falls back to any attempted subject if none qualify yet.
 */
export function weakestSubject(attempts: Attempt[], minAnswered = 3): SubjectStat | null {
  const stats = subjectStats(attempts);
  const qualified = stats.filter((s) => s.total >= minAnswered);
  const pool = qualified.length ? qualified : stats.filter((s) => s.total >= 1);
  if (pool.length === 0) return null;
  return pool.slice().sort((a, b) => a.accuracy - b.accuracy)[0];
}
