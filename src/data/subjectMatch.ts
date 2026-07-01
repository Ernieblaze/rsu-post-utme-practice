import type { BankQuestion } from '../types';
import type { Course } from './rsuData';

/**
 * Canonical display name -> historical bank.json subject name(s).
 * The bank keeps its existing subject strings (so nothing already published
 * breaks); this layer only translates for matching/display in the new
 * course-based UI. "About RSU" and "RSU Rules" are merged into one
 * "RSU General Knowledge" pool per the new naming convention.
 */
const CANONICAL_TO_BANK_SUBJECTS: Record<string, string[]> = {
  // Subjects merged in bank.json — only one name remains on disk now
  'Use of English': ['Use of English'],
  'Current Affairs': ['Nigeria Current Affairs'],
  'RSU General Knowledge': ['About RSU & Rules', 'RSU General Knowledge'],
  // Core science / maths
  Mathematics: ['Mathematics'],
  Physics: ['Physics'],
  Chemistry: ['Chemistry'],
  Biology: ['Biology'],
  Geography: ['Geography'],
  // Arts & social science
  CRS: ['CRS'],
  Economics: ['Economics'],
  Government: ['Government'],
  History: ['History'],
  Literature: ['Literature', 'Literature in English'],
  Commerce: ['Commerce'],
  Accounting: ['Accounting', 'Financial Accounting'],
  // New subjects (questions coming soon)
  'Computer Studies': ['Computer Studies', 'Computer Science'],
  IRS: ['IRS', 'Islamic Religious Studies'],
};

/** A JAMB combo slot is a generic elective ("Any Social Science subject") rather than a named subject. */
export function isGenericSlot(slot: string): boolean {
  return /^Any /i.test(slot.trim());
}

/** Split a combo slot like "Chemistry/Biology/Economics" into its alternative options. */
export function slotOptions(slot: string): string[] {
  return slot.split('/').map((s) => s.trim());
}

/** Pooled, deduplicated questions for one JAMB combo slot — satisfied if ANY of its options has content. */
export function poolForSlot(bank: BankQuestion[], slot: string): BankQuestion[] {
  if (isGenericSlot(slot)) return [];
  const seen = new Set<string>();
  const pool: BankQuestion[] = [];
  slotOptions(slot).forEach((subject) => {
    questionsForSubject(bank, subject).forEach((q) => {
      if (!seen.has(q.id)) {
        seen.add(q.id);
        pool.push(q);
      }
    });
  });
  return pool;
}

/** Per-slot question counts for a course (slot, not flattened subject — correctly treats "A/B/C" as satisfied by any one). */
export function slotCoverageForCourse(bank: BankQuestion[], course: Course): { slot: string; available: number }[] {
  return course.jambSubjects
    .filter((slot) => !isGenericSlot(slot))
    .map((slot) => ({ slot, available: poolForSlot(bank, slot).length }));
}

/** All distinct, non-generic canonical subject names a course's combo could resolve to. */
export function namedSubjectsForCourse(course: Course): string[] {
  const set = new Set<string>();
  course.jambSubjects.forEach((slot) => {
    if (isGenericSlot(slot)) return;
    slotOptions(slot).forEach((opt) => set.add(opt));
  });
  return Array.from(set);
}

/** Bank subject name(s) that satisfy a canonical subject name, for filtering bank.json. */
export function bankSubjectsFor(canonicalSubject: string): string[] {
  return CANONICAL_TO_BANK_SUBJECTS[canonicalSubject] ?? [canonicalSubject];
}

/**
 * Actual bank.json subject strings relevant to a course: its named JAMB
 * subjects plus Current Affairs and RSU General Knowledge, translated to
 * whichever real subject names are present in the bank. Used to pre-filter
 * the Revision/Practice subject pickers once a course is selected.
 */
export function relevantBankSubjects(bank: BankQuestion[], course: Course): string[] {
  const bankSubjects = new Set(bank.map((q) => q.subject));
  const canonical = [...namedSubjectsForCourse(course), 'Current Affairs', 'RSU General Knowledge'];
  const result = new Set<string>();
  canonical.forEach((c) => {
    bankSubjectsFor(c).forEach((name) => {
      if (bankSubjects.has(name)) result.add(name);
    });
  });
  return Array.from(result);
}

export function questionsForSubject(bank: BankQuestion[], canonicalSubject: string): BankQuestion[] {
  const names = new Set(bankSubjectsFor(canonicalSubject));
  return bank.filter((q) => names.has(q.subject));
}

/** How many usable questions exist for each named (non-generic) subject a course needs. */
export function coverageForCourse(bank: BankQuestion[], course: Course): Record<string, number> {
  const coverage: Record<string, number> = {};
  namedSubjectsForCourse(course).forEach((subject) => {
    coverage[subject] = questionsForSubject(bank, subject).length;
  });
  return coverage;
}

/**
 * A course is "ready" once every named subject in its combo has at least
 * `minPerSubject` questions. Generic elective slots ("Any other subject")
 * are never blocking since the student can pick any covered subject there.
 */
export function isCourseReady(bank: BankQuestion[], course: Course, minPerSubject = 5): boolean {
  const coverage = coverageForCourse(bank, course);
  return Object.values(coverage).every((count) => count >= minPerSubject);
}

/** All distinct canonical subjects available across the whole bank, for free-pick UI (Practice section). */
export function allCanonicalSubjectsInBank(bank: BankQuestion[]): string[] {
  const bankSubjects = new Set(bank.map((q) => q.subject));
  const result = new Set<string>();
  Object.entries(CANONICAL_TO_BANK_SUBJECTS).forEach(([canonical, names]) => {
    if (names.some((n) => bankSubjects.has(n))) result.add(canonical);
  });
  // Any bank subject not covered by an alias maps to itself (e.g. future subjects added straight with their real name).
  bankSubjects.forEach((s) => {
    const aliased = Object.values(CANONICAL_TO_BANK_SUBJECTS).some((names) => names.includes(s));
    if (!aliased) result.add(s);
  });
  return Array.from(result).sort();
}
