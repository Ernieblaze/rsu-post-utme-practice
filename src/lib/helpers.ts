import type { Attempt, OptionKey, Question, Test } from '../types';

/**
 * The option letters that actually have text for a question. Questions with
 * only A–D (E left blank) return ['A','B','C','D'] so empty option boxes are
 * never displayed. Order is always preserved (A,B,C,D,E).
 */
export function visibleOptionKeys(options: Record<OptionKey, string>): OptionKey[] {
  return (['A', 'B', 'C', 'D', 'E'] as OptionKey[]).filter(
    (k) => options[k] != null && String(options[k]).trim() !== ''
  );
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateResult(
  test: Test,
  answers: Record<number, OptionKey>,
  timeLeftSeconds: number
): Attempt {
  const durationSeconds = test.durationMinutes * 60;
  const timeSpentSeconds = Math.max(0, durationSeconds - timeLeftSeconds);
  const breakdownMap = new Map<string, { total: number; correct: number }>();

  let score = 0;
  test.questions.forEach((q) => {
    const entry = breakdownMap.get(q.subject) || { total: 0, correct: 0 };
    entry.total += 1;
    if (answers[q.id] === q.answer) {
      entry.correct += 1;
      score += 1;
    }
    breakdownMap.set(q.subject, entry);
  });

  const subjectBreakdown = Array.from(breakdownMap.entries())
    .map(([subject, { total, correct }]) => ({ subject, total, correct }))
    .sort((a, b) => a.subject.localeCompare(b.subject));

  const total = test.questions.length;

  return {
    id: `${test.id}-${Date.now()}`,
    testId: test.id,
    testTitle: test.title,
    score,
    total,
    percentage: total > 0 ? Math.round((score / total) * 100) : 0,
    timeSpentSeconds,
    durationSeconds,
    date: new Date().toISOString(),
    subjectBreakdown,
    selectedAnswers: { ...answers },
  };
}

export function getLastAttemptForTest(attempts: Attempt[], testId: string): Attempt | undefined {
  return attempts.find((a) => a.testId === testId);
}

export function getTestAverage(attempts: Attempt[], testId: string): number {
  const list = attempts.filter((a) => a.testId === testId);
  if (!list.length) return 0;
  return Math.round(list.reduce((sum, a) => sum + a.percentage, 0) / list.length);
}

export function getTestBestScore(attempts: Attempt[], testId: string): number {
  const list = attempts.filter((a) => a.testId === testId);
  if (!list.length) return 0;
  return Math.max(...list.map((a) => a.percentage));
}

export function overallWeakAreas(attempts: Attempt[]) {
  const map = new Map<string, { total: number; correct: number }>();
  attempts.forEach((a) => {
    a.subjectBreakdown.forEach(({ subject, total, correct }) => {
      const cur = map.get(subject) || { total: 0, correct: 0 };
      cur.total += total;
      cur.correct += correct;
      map.set(subject, cur);
    });
  });
  return Array.from(map.entries())
    .map(([subject, { total, correct }]) => ({
      subject,
      total,
      correct,
      accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

export function gradeMessage(percentage: number): { text: string; color: string } {
  if (percentage >= 80) return { text: 'Excellent work!', color: 'text-emerald-600 dark:text-emerald-400' };
  if (percentage >= 60) return { text: 'Good job — keep pushing!', color: 'text-blue-600 dark:text-blue-400' };
  if (percentage >= 40) return { text: 'Fair — review your weak areas.', color: 'text-amber-600 dark:text-amber-400' };
  return { text: 'Keep practicing — you will improve!', color: 'text-rose-600 dark:text-rose-400' };
}

export function performanceBand(percentage: number) {
  if (percentage >= 90) {
    return { label: 'Distinction', message: 'Outstanding', color: 'bg-emerald-500 text-white', textColor: 'text-emerald-600 dark:text-emerald-400' };
  }
  if (percentage >= 70) {
    return { label: 'Merit', message: 'Well done', color: 'bg-school-green text-white', textColor: 'text-school-green' };
  }
  if (percentage >= 50) {
    return { label: 'Pass', message: 'Keep practicing', color: 'bg-amber-400 text-school-navy', textColor: 'text-amber-600 dark:text-amber-400' };
  }
  return { label: 'Review', message: 'Review your weak areas', color: 'bg-rose-500 text-white', textColor: 'text-rose-600 dark:text-rose-400' };
}

export function subjectColor(index: number): string {
  const colors = [
    'bg-blue-500',
    'bg-school-green',
    'bg-amber-400',
    'bg-purple-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-orange-500',
    'bg-indigo-500',
  ];
  return colors[index % colors.length];
}

export function questionStatus(
  q: Question,
  answers: Record<number, string>
): 'answered' | 'unanswered' {
  return answers[q.id] ? 'answered' : 'unanswered';
}

export interface RevisionItem {
  testId: string;
  testTitle: string;
  question: Question;
}

export function flattenQuestions(tests: Test[]): RevisionItem[] {
  return tests.flatMap((test) =>
    test.questions.map((q) => ({ testId: test.id, testTitle: test.title, question: q }))
  );
}
