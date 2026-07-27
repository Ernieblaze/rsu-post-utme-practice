/**
 * WAEC (SSCE) exam pack. WAEC students sit English + Mathematics (core) plus
 * subjects from their track (Science / Arts / Commercial). Questions come from
 * the dedicated WAEC bank merged with the shared academic pool (the RSU bank
 * covers many of the same subjects), matched through a small alias map so a few
 * naming differences (English Language ↔ Use of English) still resolve.
 */
import type { BankQuestion, Question, Test } from '../types';
import waecBank from './waec-bank.json';

export interface WaecTrack {
  id: 'science' | 'arts' | 'commercial';
  name: string;
  emoji: string;
  /** Track electives (the core English + Maths are added automatically). */
  subjects: string[];
}

/** English + Maths are compulsory for every WAEC candidate. */
export const WAEC_CORE: string[] = ['English Language', 'Mathematics'];

export const WAEC_TRACKS: WaecTrack[] = [
  { id: 'science', name: 'Science', emoji: '🔬', subjects: ['Biology', 'Physics', 'Chemistry', 'Further Mathematics', 'Agricultural Science', 'Geography'] },
  { id: 'arts', name: 'Arts', emoji: '📖', subjects: ['Literature-in-English', 'Government', 'CRS', 'IRS', 'History', 'Geography'] },
  { id: 'commercial', name: 'Commercial', emoji: '📊', subjects: ['Economics', 'Commerce', 'Financial Accounting', 'Government', 'Mathematics'] },
];

/** WAEC subject name → the bank subject name(s) that satisfy it. */
const WAEC_TO_BANK: Record<string, string[]> = {
  'English Language': ['English Language', 'Use of English'],
  Mathematics: ['Mathematics'],
  Biology: ['Biology'],
  Physics: ['Physics'],
  Chemistry: ['Chemistry'],
  Economics: ['Economics'],
  Government: ['Government'],
  'Literature-in-English': ['Literature-in-English', 'Literature in English'],
  Geography: ['Geography'],
  Commerce: ['Commerce'],
  'Financial Accounting': ['Financial Accounting', 'Accounting'],
  CRS: ['CRS'],
  IRS: ['IRS', 'Islamic Religious Knowledge'],
  History: ['History'],
  'Further Mathematics': ['Further Mathematics'],
  'Agricultural Science': ['Agricultural Science'],
};

export const WAEC_COUNT_OPTIONS = [10, 20, 40] as const;
export const WAEC_TIMED_MINUTES_PER_Q = 1; // ~1 min/question when timed
export const WAEC_UNTIMED_MINUTES = 999;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Combined WAEC pool = dedicated WAEC bank + the shared academic bank passed in. */
function combined(rsuBank: BankQuestion[]): BankQuestion[] {
  return [...(waecBank as unknown as BankQuestion[]), ...rsuBank];
}

function pool(bank: BankQuestion[], waecSubject: string): BankQuestion[] {
  const names = new Set(WAEC_TO_BANK[waecSubject] ?? [waecSubject]);
  return bank.filter((q) => (q.type === 'single' || !q.type) && names.has(q.subject));
}

/** How many questions are available for a WAEC subject (for the picker readiness). */
export function waecSubjectCount(rsuBank: BankQuestion[], waecSubject: string): number {
  return pool(combined(rsuBank), waecSubject).length;
}

/**
 * Build a WAEC practice set from the chosen subjects, `perSubject` questions
 * each, grouped by subject. Returns null if nothing is available.
 */
export function buildWaecMock(
  rsuBank: BankQuestion[],
  chosen: string[],
  perSubject: number,
  durationMinutes: number
): Test | null {
  const bank = combined(rsuBank);
  const subjects = Array.from(new Set(chosen));
  const picked: BankQuestion[] = [];
  const seenText = new Set<string>();
  subjects.forEach((sub) => {
    const fresh = shuffle(pool(bank, sub)).filter((q) => {
      const key = q.text.trim().toLowerCase();
      if (seenText.has(key)) return false;
      seenText.add(key);
      return true;
    });
    picked.push(...fresh.slice(0, perSubject));
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
    id: `waec-practice-${Date.now()}`,
    title: 'WAEC Practice',
    description: `${questions.length} questions across ${subjects.length} subject(s) — your WAEC track.`,
    durationMinutes,
    questions,
  };
}
