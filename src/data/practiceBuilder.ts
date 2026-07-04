import type { BankQuestion, Question, Test } from '../types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface PracticeFilter {
  subjects: string[];
  topics: string[];
}

export function filterForPractice(bank: BankQuestion[], filter: PracticeFilter): BankQuestion[] {
  return bank.filter((q) => {
    if (q.type !== 'single') return false;
    if (filter.subjects.length > 0 && !filter.subjects.includes(q.subject)) return false;
    if (filter.topics.length > 0 && !(q.topic && filter.topics.includes(q.topic))) return false;
    return true;
  });
}

/**
 * Build a custom practice Test from a free pick of subjects/topics (the
 * "Practice" section, as opposed to Exam Focus's fixed course blueprint).
 * `durationMinutes` is generous by default since this mode is meant to feel
 * untimed — Quiz always shows a countdown, so "no timer" is approximated
 * with a long duration rather than touching the shared quiz engine.
 */
export function buildPracticeTest(
  bank: BankQuestion[],
  filter: PracticeFilter,
  count: number,
  durationMinutes: number,
  title: string
): Test | null {
  const pool = filterForPractice(bank, filter);
  if (pool.length === 0) return null;

  // Randomly pick the requested number, then GROUP them by subject (like the
  // real RSU exam) instead of leaving them scrambled across subjects.
  const picked = shuffle(pool)
    .slice(0, Math.min(count, pool.length))
    .sort((a, b) => a.subject.localeCompare(b.subject));
  const questions: Question[] = picked.map((q, idx) => ({
    id: idx + 1,
    subject: q.subject,
    topic: q.topic || undefined,
    text: q.text,
    options: { ...q.options },
    answer: q.answer,
    explanation: q.explanation,
  }));

  return {
    id: `practice-${Date.now()}`,
    title,
    description: `${questions.length} question(s) drawn from your selected subjects and topics.`,
    durationMinutes,
    questions,
  };
}
