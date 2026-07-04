import type { BankQuestion, Question, Test } from '../types';
import type { Course } from './rsuData';
import { isGenericSlot, poolForSlot, questionsForSubject } from './subjectMatch';

// Real RSU Post-UTME shape: 50 questions in 30 minutes, kept SEPARATED by
// subject (not scrambled together). The JAMB subjects share 40 questions
// (~10 each for a 4-subject combo), plus 5 Current Affairs and 5 About RSU.
const JAMB_QUOTA = 40;
const CURRENT_AFFAIRS_QUOTA = 5;
const GENERAL_KNOWLEDGE_QUOTA = 5;

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
 * Build a personalized Exam Focus mock for a course, mirroring the real RSU
 * Post-UTME structure:
 *
 *  - 50 questions / 30 minutes
 *  - Questions are GROUPED BY SUBJECT in a fixed order (English section, then
 *    the next subject's section, and so on) — never mixed together. This is
 *    the key difference from the old shuffled format.
 *  - Each subject's own questions are randomised internally for variety.
 *  - `seenIds` (from the student's past attempts) are de-prioritised, so a
 *    retake serves fresh questions first and only repeats once the pool for a
 *    subject is exhausted.
 *
 * Subjects without enough published questions yet are simply shorter rather
 * than blocking the exam, and the gap is reported back.
 */
export function buildExamFocusTest(
  bank: BankQuestion[],
  course: Course,
  seenIds: Set<string> = new Set()
): ExamBlueprintResult {
  const namedSlots = course.jambSubjects.filter((slot) => !isGenericSlot(slot));
  const gaps: ExamBlueprintGap[] = [];
  // Grouped, in order: each entry is one subject section's questions.
  const sections: BankQuestion[][] = [];
  // Prevents the same question appearing twice when slots overlap (e.g. Law's
  // "two of Government/CRS/History" repeats the same slot string).
  const usedIds = new Set<string>();

  // Take `count` questions from a pool, preferring ones the student hasn't
  // seen in past attempts, and never reusing one already picked for this exam.
  function take(pool: BankQuestion[], count: number): BankQuestion[] {
    const available = pool.filter((q) => !usedIds.has(q.id));
    const unseen = shuffle(available.filter((q) => !seenIds.has(q.id)));
    const seen = shuffle(available.filter((q) => seenIds.has(q.id)));
    const chosen = [...unseen, ...seen].slice(0, count);
    chosen.forEach((q) => usedIds.add(q.id));
    return chosen;
  }

  if (namedSlots.length > 0) {
    const perSlot = Math.floor(JAMB_QUOTA / namedSlots.length);
    let remainder = JAMB_QUOTA - perSlot * namedSlots.length;

    namedSlots.forEach((slot) => {
      const want = perSlot + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder -= 1;
      const pool = poolForSlot(bank, slot);
      const chosen = take(pool, want);
      if (chosen.length > 0) sections.push(chosen);
      if (chosen.length < want) {
        gaps.push({ slot, requested: want, available: chosen.length });
      }
    });
  }

  const currentAffairsPool = questionsForSubject(bank, 'Current Affairs');
  const currentAffairs = take(currentAffairsPool, CURRENT_AFFAIRS_QUOTA);
  if (currentAffairs.length > 0) sections.push(currentAffairs);
  if (currentAffairs.length < CURRENT_AFFAIRS_QUOTA) {
    gaps.push({ slot: 'Current Affairs', requested: CURRENT_AFFAIRS_QUOTA, available: currentAffairs.length });
  }

  const generalKnowledgePool = questionsForSubject(bank, 'RSU General Knowledge');
  const generalKnowledge = take(generalKnowledgePool, GENERAL_KNOWLEDGE_QUOTA);
  if (generalKnowledge.length > 0) sections.push(generalKnowledge);
  if (generalKnowledge.length < GENERAL_KNOWLEDGE_QUOTA) {
    gaps.push({ slot: 'RSU General Knowledge', requested: GENERAL_KNOWLEDGE_QUOTA, available: generalKnowledge.length });
  }

  // Flatten the subject sections IN ORDER — grouped, not shuffled together.
  const ordered = sections.flat();
  const questions = ordered.map((q, idx) => toQuestion(q, idx));

  const test: Test = {
    id: `exam-focus-${course.id}-${Date.now()}`,
    title: `Exam Focus: ${course.name}`,
    description: `Realistic ${questions.length}-question RSU Post-UTME mock for ${course.name} — subjects grouped just like the real exam, with fresh questions each attempt.`,
    durationMinutes: 30,
    questions,
  };

  return { test, gaps, usedIds: [...usedIds] };
}
