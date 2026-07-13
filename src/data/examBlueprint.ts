import type { BankQuestion, Question, Test } from '../types';
import type { Course } from './rsuData';
import { isGenericSlot, poolForSlot, questionsForSubject, slotOptions } from './subjectMatch';

/**
 * Real RSU Post-UTME shape: EXACTLY 50 questions in 30 minutes, kept SEPARATED
 * by subject (not scrambled). Verified structure (science example):
 *   English 10 · Maths 10 · Chemistry 10 · Biology 10 · Physics 5 · General 5 = 50
 *
 * So the split is NOT even — most subjects carry ~10, ONE supporting subject is
 * reduced to 5, and there are 5 "General Knowledge" questions (About RSU +
 * Current Affairs pooled). The same fixed structure applies to every course;
 * only the Practice section lets students choose their own count/time.
 */
const TOTAL = 50;
const GENERAL_QUOTA = 5;                 // About RSU + Current Affairs, pooled
const ACADEMIC_QUOTA = TOTAL - GENERAL_QUOTA; // 45 across the course's subjects
const MINOR_QUOTA = 5;                    // the one "supporting" subject dropped to 5

// Which subject to reduce to 5 when a course has several — the supporting ones,
// most-reducible first. Use of English (and the course's core subjects) are
// never chosen here, so they keep the heavier weighting.
const MINOR_PRIORITY = [
  'Physics', 'Geography', 'Commerce', 'Government', 'CRS',
  'Islamic Religious Knowledge', 'History', 'Literature in English',
  'Computer Studies', 'Economics', 'Biology', 'Chemistry', 'Mathematics',
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface ExamBlueprintGap {
  slot: string;
  requested: number;
  available: number;
}

export interface ExamBlueprintResult {
  test: Test;
  gaps: ExamBlueprintGap[];
  /** Bank IDs used in this exam, so the caller can mark them "seen" for next time. */
  usedIds: string[];
}

function toQuestion(q: BankQuestion, idx: number): Question {
  return {
    id: idx + 1,
    subject: q.subject,
    topic: q.topic || undefined,
    text: q.text,
    options: { ...q.options },
    answer: q.answer,
    explanation: q.explanation,
  };
}

/**
 * Per-subject question quotas for a course, matching the real RSU structure:
 * 45 academic + 5 general = 50, with one supporting subject reduced to 5.
 */
function academicQuotas(namedSlots: string[]): Map<string, number> {
  const slots = Array.from(new Set(namedSlots)); // de-duplicate (e.g. Law lists a slot twice)
  const quotas = new Map<string, number>();
  const n = slots.length;
  if (n === 0) return quotas;
  if (n === 1) {
    quotas.set(slots[0], ACADEMIC_QUOTA);
    return quotas;
  }

  // Pick the "minor" slot to reduce to 5.
  let minorSlot = slots[slots.length - 1]; // fallback: the last-listed subject
  for (const pref of MINOR_PRIORITY) {
    const found = slots.find((s) => slotOptions(s).includes(pref));
    if (found) { minorSlot = found; break; }
  }
  quotas.set(minorSlot, MINOR_QUOTA);

  // Spread the remaining 40 across the other subjects (heavier ones first).
  const majors = slots.filter((s) => s !== minorSlot);
  const remaining = ACADEMIC_QUOTA - MINOR_QUOTA; // 40
  const base = Math.floor(remaining / majors.length);
  let extra = remaining - base * majors.length;
  majors.forEach((s) => {
    quotas.set(s, base + (extra > 0 ? 1 : 0));
    if (extra > 0) extra -= 1;
  });
  return quotas;
}

/**
 * Build a personalized Exam Focus mock for a course, mirroring the real RSU
 * Post-UTME: 50 questions / 30 minutes, grouped by subject in a fixed order,
 * with the verified per-subject counts (most subjects ~10, one supporting
 * subject 5, plus 5 General Knowledge). `seenIds` are de-prioritised so retakes
 * serve fresh questions first. Subjects short on questions are simply shorter
 * and reported back rather than blocking the exam.
 */
export function buildExamFocusTest(
  bank: BankQuestion[],
  course: Course,
  seenIds: Set<string> = new Set()
): ExamBlueprintResult {
  const namedSlots = course.jambSubjects.filter((slot) => !isGenericSlot(slot));
  const quotas = academicQuotas(namedSlots);
  const gaps: ExamBlueprintGap[] = [];
  const sections: BankQuestion[][] = [];
  const usedIds = new Set<string>();
  const usedTexts = new Set<string>(); // guards against duplicate CONTENT (same text, different id)

  const normText = (t: string) => t.trim().toLowerCase().replace(/\s+/g, ' ');

  function take(pool: BankQuestion[], count: number): BankQuestion[] {
    // Exclude anything already used in this exam — by id AND by wording, so two
    // differently-keyed but identically-worded questions can never both appear.
    const available = pool.filter((q) => !usedIds.has(q.id) && !usedTexts.has(normText(q.text)));
    const unseen = shuffle(available.filter((q) => !seenIds.has(q.id)));
    const seen = shuffle(available.filter((q) => seenIds.has(q.id)));
    const chosen = [...unseen, ...seen].slice(0, count);
    chosen.forEach((q) => { usedIds.add(q.id); usedTexts.add(normText(q.text)); });
    return chosen;
  }

  // Academic subjects, in the course's listed order, at their fixed quotas.
  Array.from(new Set(namedSlots)).forEach((slot) => {
    const want = quotas.get(slot) ?? 0;
    if (want <= 0) return;
    const chosen = take(poolForSlot(bank, slot), want);
    if (chosen.length > 0) sections.push(chosen);
    if (chosen.length < want) gaps.push({ slot, requested: want, available: chosen.length });
  });

  // General Knowledge: 5 questions that are a GUARANTEED MIX of "About RSU"
  // (questions about the school) and Nigeria Current Affairs — the real exam
  // blends both, so we draw a fixed share from each rather than sampling one
  // combined pool (which, with far more current-affairs questions, would often
  // return zero RSU questions). If either pool is short, we backfill from the
  // other so the section still totals 5.
  const RSU_GK_SHARE = 2; // at least 2 "about the school" questions
  let general = [
    ...take(questionsForSubject(bank, 'RSU General Knowledge'), RSU_GK_SHARE),
    ...take(questionsForSubject(bank, 'Current Affairs'), GENERAL_QUOTA - RSU_GK_SHARE),
  ];
  if (general.length < GENERAL_QUOTA) {
    const backfill = [
      ...questionsForSubject(bank, 'Current Affairs'),
      ...questionsForSubject(bank, 'RSU General Knowledge'),
    ];
    general = [...general, ...take(backfill, GENERAL_QUOTA - general.length)];
  }
  general = shuffle(general); // interleave RSU + current affairs so it reads as one mixed section
  if (general.length > 0) sections.push(general);
  if (general.length < GENERAL_QUOTA) {
    gaps.push({ slot: 'General Knowledge', requested: GENERAL_QUOTA, available: general.length });
  }

  const ordered = sections.flat();
  const questions = ordered.map((q, idx) => toQuestion(q, idx));

  const test: Test = {
    id: `exam-focus-${course.id}-${Date.now()}`,
    title: `Exam Focus: ${course.name}`,
    description: `Realistic ${questions.length}-question RSU Post-UTME mock for ${course.name} — the exact per-subject structure of the real exam, with fresh questions each attempt.`,
    durationMinutes: 30,
    questions,
  };

  return { test, gaps, usedIds: [...usedIds] };
}
