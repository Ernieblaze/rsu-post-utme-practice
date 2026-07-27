/**
 * JAMB (UTME) exam pack. Reuses the existing question bank — those questions
 * were built from JAMB-syllabus past questions, so they're valid JAMB practice.
 * JAMB format: Use of English (compulsory) + 3 chosen subjects, 180 questions
 * (English 60, others 40 each), timed ~2 hours. Purely academic — RSU-only
 * pools (About RSU, Current Affairs) are excluded.
 */
import type { BankQuestion, Question, Test } from '../types';

export const JAMB_COMPULSORY = 'Use of English';

/** JAMB subjects that exist in the bank today (English is always required). */
export const JAMB_SUBJECTS: string[] = [
  'Use of English',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Government',
  'Literature in English',
  'CRS',
  'Islamic Religious Knowledge',
  'Commerce',
  'Geography',
  'History',
  'Computer Studies',
];

export const JAMB_ENGLISH_COUNT = 60;
export const JAMB_OTHER_COUNT = 40;
export const JAMB_DURATION_MINUTES = 120;
export const JAMB_MAX_OTHER_SUBJECTS = 3;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pool(bank: BankQuestion[], subject: string): BankQuestion[] {
  return bank.filter((q) => (q.type === 'single' || !q.type) && q.subject === subject);
}

export interface JambMockOptions {
  /** Questions from Use of English (default: full 60). */
  englishCount?: number;
  /** Questions from each other subject (default: full 40). */
  otherCount?: number;
  /** Timer in minutes (default: full 120). */
  durationMinutes?: number;
}

/**
 * Build a JAMB mock: English + up to 3 chosen subjects, grouped by subject like
 * a real paper. Defaults to the full UTME shape (English 60, others 40, 120 min);
 * pass options for a lighter "quick practice" run. Returns null if empty.
 */
export function buildJambMock(bank: BankQuestion[], chosen: string[], opts: JambMockOptions = {}): Test | null {
  const englishCount = opts.englishCount ?? JAMB_ENGLISH_COUNT;
  const otherCount = opts.otherCount ?? JAMB_OTHER_COUNT;
  const duration = opts.durationMinutes ?? JAMB_DURATION_MINUTES;

  const others = chosen.filter((s) => s !== JAMB_COMPULSORY).slice(0, JAMB_MAX_OTHER_SUBJECTS);
  const subjects = [JAMB_COMPULSORY, ...others];

  const picked: BankQuestion[] = [];
  subjects.forEach((sub) => {
    const want = sub === JAMB_COMPULSORY ? englishCount : otherCount;
    picked.push(...shuffle(pool(bank, sub)).slice(0, want));
  });
  if (picked.length === 0) return null;

  const ordered = picked.sort((a, b) => a.subject.localeCompare(b.subject));
  const questions: Question[] = ordered.map((q, idx) => ({
    id: idx + 1,
    subject: q.subject,
    topic: q.topic || undefined,
    text: q.text,
    options: { ...q.options },
    answer: q.answer,
    explanation: q.explanation,
  }));

  return {
    id: `jamb-mock-${Date.now()}`,
    title: 'JAMB Mock (UTME)',
    description: `${questions.length} questions across ${subjects.length} subjects — English + your chosen subjects.`,
    durationMinutes: duration,
    questions,
  };
}

/** How many bank questions exist for a subject (for the picker to show readiness). */
export function jambSubjectCount(bank: BankQuestion[], subject: string): number {
  return pool(bank, subject).length;
}
