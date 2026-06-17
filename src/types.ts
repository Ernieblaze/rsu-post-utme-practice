export type OptionKey = 'A' | 'B' | 'C' | 'D' | 'E';

export interface Question {
  id: number;
  subject: string;
  text: string;
  options: Record<OptionKey, string>;
  answer: OptionKey;
  explanation: string;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  questions: Question[];
}

export interface SubjectBreakdown {
  subject: string;
  total: number;
  correct: number;
}

export interface Attempt {
  id: string;
  testId: string;
  testTitle: string;
  score: number;
  total: number;
  percentage: number;
  timeSpentSeconds: number;
  durationSeconds: number;
  date: string;
  subjectBreakdown: SubjectBreakdown[];
  selectedAnswers: Record<number, OptionKey>;
}

export interface ActiveTestState {
  testId: string;
  startedAt: number;
  answers: Record<number, OptionKey>;
  currentIndex: number;
  flagged: number[];
}

/* ---- Question bank (admin-managed) types ---- */

export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'single' | 'multiple';

export interface BankQuestion {
  id: string;
  university: string;
  year: string;
  subject: string;
  topic: string;
  difficulty: Difficulty;
  type: QuestionType;
  text: string;
  options: Record<OptionKey, string>;
  answer: OptionKey; // primary correct answer (single-choice)
  answers?: OptionKey[]; // all correct answers (multiple-choice)
  explanation: string;
}

export interface Profile {
  name: string;
}
