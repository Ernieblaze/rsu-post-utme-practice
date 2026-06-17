import type { BankQuestion, OptionKey, Question, Test } from '../types';
import { tests } from './tests';
import publishedBank from './bank.json';

/**
 * The question bank has two layers:
 *
 *  1. PUBLISHED bank — `src/data/bank.json`. This ships in the build, so every
 *     student sees it. You update it by exporting from the Admin panel,
 *     replacing this file, committing, and redeploying.
 *
 *  2. LOCAL working copy — saved in the admin's browser (localStorage). Only the
 *     admin who makes edits sees it, until they export + publish.
 *
 * When `bank.json` is empty (the starting state), the bank is seeded from the
 * 100 built-in questions in `tests.ts`, so nothing is ever lost.
 */

const DEFAULT_UNIVERSITY = 'Rivers State University';

function parseYear(title: string): string {
  const m = title.match(/(19|20)\d{2}/);
  if (m) return m[0];
  // Fall back to a stable label derived from the test number.
  const t = title.match(/(\d+)/);
  return t ? `Set ${t[1]}` : 'General';
}

/** Convert the built-in tests into bank questions (used only when bank.json is empty). */
export function seedFromTests(): BankQuestion[] {
  const out: BankQuestion[] = [];
  tests.forEach((test) => {
    const year = parseYear(test.title);
    test.questions.forEach((q) => {
      out.push({
        id: `seed-${test.id}-${q.id}`,
        university: DEFAULT_UNIVERSITY,
        year,
        subject: q.subject,
        topic: '',
        difficulty: 'medium',
        type: 'single',
        text: q.text,
        options: { ...q.options },
        answer: q.answer,
        explanation: q.explanation,
      });
    });
  });
  return out;
}

/** The canonical published set every student sees on this deploy. */
export function getPublishedBank(): BankQuestion[] {
  const arr = publishedBank as unknown as BankQuestion[];
  if (Array.isArray(arr) && arr.length > 0) return arr;
  return seedFromTests();
}

/** Stable list of subjects present in a bank. */
export function uniqueValues(bank: BankQuestion[], key: keyof BankQuestion): string[] {
  const set = new Set<string>();
  bank.forEach((q) => {
    const v = q[key];
    if (typeof v === 'string' && v.trim()) set.add(v.trim());
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface BankFilter {
  university?: string;
  year?: string;
  subject?: string;
  difficulty?: string;
}

export function filterBank(bank: BankQuestion[], f: BankFilter): BankQuestion[] {
  return bank.filter((q) => {
    if (f.university && q.university !== f.university) return false;
    if (f.year && q.year !== f.year) return false;
    if (f.subject && q.subject !== f.subject) return false;
    if (f.difficulty && q.difficulty !== f.difficulty) return false;
    return true;
  });
}

/**
 * Build a runnable Test from the bank. The quiz engine grades single-answer
 * questions, so generated practice uses `type === 'single'` questions and
 * assigns sequential numeric ids (matching the built-in Test format).
 */
export function buildTestFromBank(
  bank: BankQuestion[],
  filter: BankFilter,
  count: number,
  durationMinutes: number
): Test | null {
  const pool = filterBank(bank, filter).filter((q) => q.type === 'single');
  if (pool.length === 0) return null;

  const picked = shuffle(pool).slice(0, Math.min(count, pool.length));
  const questions: Question[] = picked.map((q, idx) => ({
    id: idx + 1,
    subject: q.subject,
    text: q.text,
    options: { ...q.options },
    answer: q.answer,
    explanation: q.explanation,
  }));

  const labelParts = [filter.subject, filter.year, filter.university]
    .filter(Boolean)
    .join(' • ');

  return {
    id: `bank-${Date.now()}`,
    title: labelParts ? `Practice: ${labelParts}` : 'Custom Practice',
    description: `${questions.length} question(s) drawn from your question bank.`,
    durationMinutes,
    questions,
  };
}

export const OPTION_KEYS: OptionKey[] = ['A', 'B', 'C', 'D', 'E'];
