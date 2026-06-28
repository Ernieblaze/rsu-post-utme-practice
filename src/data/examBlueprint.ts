import type { BankQuestion, Question, Test } from '../types';
import type { Course } from './rsuData';
import { isGenericSlot, poolForSlot, questionsForSubject } from './subjectMatch';

const JAMB_QUOTA = 36;
const CURRENT_AFFAIRS_QUOTA = 7;
const GENERAL_KNOWLEDGE_QUOTA = 7;

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
 * Build a personalized Exam Focus test for a course: ~36 questions spread
 * across its JAMB subject slots, plus 7 Current Affairs and 7 RSU General
 * Knowledge. Slots without enough (or any) published questions yet are
 * simply skipped rather than padded or blocked — the exam comes out
 * shorter than 50 until that subject's content is uploaded, and the gap
 * is reported back so the UI can say so plainly.
 */
export function buildExamFocusTest(bank: BankQuestion[], course: Course): ExamBlueprintResult {
  const namedSlots = course.jambSubjects.filter((slot) => !isGenericSlot(slot));
  const gaps: ExamBlueprintGap[] = [];
  const picked: BankQuestion[] = [];
  // Tracks every question already used so repeated/overlapping slots (e.g. Law's
  // "two of Government/CRS/History" produces the same slot string twice) never
  // pick the same question into the exam more than once.
  const usedIds = new Set<string>();

  function takeUnused(pool: BankQuestion[], count: number): BankQuestion[] {
    const fresh = pool.filter((q) => !usedIds.has(q.id));
    const take = shuffle(fresh).slice(0, count);
    take.forEach((q) => usedIds.add(q.id));
    return take;
  }

  if (namedSlots.length > 0) {
    const perSlot = Math.floor(JAMB_QUOTA / namedSlots.length);
    let remainder = JAMB_QUOTA - perSlot * namedSlots.length;

    namedSlots.forEach((slot) => {
      const want = perSlot + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder -= 1;
      const pool = poolForSlot(bank, slot);
      const take = takeUnused(pool, want);
      picked.push(...take);
      if (take.length < want) {
        gaps.push({ slot, requested: want, available: pool.filter((q) => !usedIds.has(q.id)).length + take.length });
      }
    });
  }

  const currentAffairsPool = questionsForSubject(bank, 'Current Affairs');
  const currentAffairs = takeUnused(currentAffairsPool, CURRENT_AFFAIRS_QUOTA);
  if (currentAffairs.length < CURRENT_AFFAIRS_QUOTA) {
    gaps.push({ slot: 'Current Affairs', requested: CURRENT_AFFAIRS_QUOTA, available: currentAffairsPool.length });
  }

  const generalKnowledgePool = questionsForSubject(bank, 'RSU General Knowledge');
  const generalKnowledge = takeUnused(generalKnowledgePool, GENERAL_KNOWLEDGE_QUOTA);
  if (generalKnowledge.length < GENERAL_KNOWLEDGE_QUOTA) {
    gaps.push({ slot: 'RSU General Knowledge', requested: GENERAL_KNOWLEDGE_QUOTA, available: generalKnowledgePool.length });
  }

  const all = shuffle([...picked, ...currentAffairs, ...generalKnowledge]);
  const questions = all.map((q, idx) => toQuestion(q, idx));

  const test: Test = {
    id: `exam-focus-${course.id}-${Date.now()}`,
    title: `Exam Focus: ${course.name}`,
    description: `Personalized ${questions.length}-question mock exam for ${course.name}, built from your JAMB subject combination plus Current Affairs and RSU General Knowledge.`,
    durationMinutes: 30,
    questions,
  };

  return { test, gaps };
}
