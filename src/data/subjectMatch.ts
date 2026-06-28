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
  'Use of English': ['English', 'Use of English'],
  'RSU General Knowledge': ['About RSU', 'RSU Rules', 'RSU General Knowledge'],
  'Current Affairs': ['Current Affairs'],
  Mathematics: ['Mathematics'],
  Physics: ['Physics'],
  Chemistry: ['Chemistry'],
  Biology: ['Biology'],
  Geography: ['Geography'],
  CRS: ['CRS'],
};

/** A JAMB combo slot is a generic elective ("Any Social Science subject") rather than a named subject. */
function isGenericSlot(slot: string): boolean {
  return /^Any /i.test(slot.trim());
}

/** Split a combo slot like "Chemistry/Biology/Economics" into its alternative options. */
function slotOptions(slot: string): string[] {
  return slot.split('/').map((s) => s.trim());
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
function bankSubjectsFor(canonicalSubject: string): string[] {
  return CANONICAL_TO_BANK_SUBJECTS[canonicalSubject] ?? [canonicalSubject];
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
