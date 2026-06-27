import type { BankQuestion, Difficulty, OptionKey, QuestionType } from '../types';
import { genId } from './bankStorage';

export interface ParseResult {
  questions: BankQuestion[];
  errors: string[];
  warnings: string[];
}

const VALID_KEYS: OptionKey[] = ['A', 'B', 'C', 'D', 'E'];
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

interface Draft {
  university?: string;
  year?: string;
  subject?: string;
  topic?: string;
  difficulty?: string;
  type?: string;
  text?: string;
  options: Partial<Record<OptionKey, string>>;
  answer?: string;
  answers?: string[];
  explanation?: string;
}

const defaults = {
  university: 'Rivers State University',
  year: 'General',
  subject: 'General',
  difficulty: 'medium' as Difficulty,
};

/** Turn a validated draft into a BankQuestion, or push an error and return null. */
function finalize(d: Draft, index: number, errors: string[], warnings: string[]): BankQuestion | null {
  const where = `Question ${index + 1}`;
  if (!d.text || !d.text.trim()) {
    errors.push(`${where}: missing question text — skipped.`);
    return null;
  }

  const options: Record<OptionKey, string> = { A: '', B: '', C: '', D: '', E: '' };
  let optionCount = 0;
  VALID_KEYS.forEach((k) => {
    const v = d.options[k];
    if (v && v.trim()) {
      options[k] = v.trim();
      optionCount++;
    }
  });
  if (optionCount < 2) {
    errors.push(`${where}: needs at least 2 options — skipped.`);
    return null;
  }

  // Resolve correct answer(s)
  const rawAnswers = (d.answers && d.answers.length ? d.answers : [d.answer || ''])
    .map((a) => a.trim().toUpperCase())
    .filter(Boolean) as string[];

  const validAnswers = rawAnswers.filter((a) => VALID_KEYS.includes(a as OptionKey) && options[a as OptionKey]);
  if (validAnswers.length === 0) {
    errors.push(`${where}: correct answer is missing or doesn't match a filled option — skipped.`);
    return null;
  }

  const type: QuestionType =
    d.type === 'multiple' || validAnswers.length > 1 ? 'multiple' : 'single';

  let difficulty: Difficulty = defaults.difficulty;
  if (d.difficulty) {
    const dl = d.difficulty.toLowerCase();
    if (DIFFICULTIES.includes(dl as Difficulty)) difficulty = dl as Difficulty;
    else warnings.push(`${where}: unknown difficulty "${d.difficulty}" — set to medium.`);
  }

  if (!d.year || !d.year.trim()) {
    warnings.push(`${where}: no year specified — defaulted to "General".`);
  }
  if (!d.subject || !d.subject.trim()) {
    warnings.push(`${where}: no subject specified — defaulted to "General".`);
  }

  return {
    id: genId(),
    university: (d.university || defaults.university).trim(),
    year: (d.year || defaults.year).trim(),
    subject: (d.subject || defaults.subject).trim(),
    topic: (d.topic || '').trim(),
    difficulty,
    type,
    text: d.text.trim(),
    options,
    answer: validAnswers[0] as OptionKey,
    answers: type === 'multiple' ? (validAnswers as OptionKey[]) : undefined,
    explanation: (d.explanation || '').trim(),
  };
}

/* ---------------- JSON ---------------- */

export function parseJson(raw: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { questions: [], errors: ['The file is not valid JSON. Check for a missing comma or bracket.'], warnings };
  }
  const arr = Array.isArray(data) ? data : (data as { questions?: unknown[] })?.questions;
  if (!Array.isArray(arr)) {
    return { questions: [], errors: ['JSON must be an array of questions, or an object with a "questions" array.'], warnings };
  }

  const questions: BankQuestion[] = [];
  arr.forEach((item, i) => {
    const o = item as Record<string, unknown>;
    const opts = (o.options || {}) as Record<string, unknown>;
    const draft: Draft = {
      university: str(o.university),
      year: str(o.year),
      subject: str(o.subject),
      topic: str(o.topic),
      difficulty: str(o.difficulty),
      type: str(o.type),
      text: str(o.text ?? o.question),
      options: {
        A: str(opts.A ?? opts.a),
        B: str(opts.B ?? opts.b),
        C: str(opts.C ?? opts.c),
        D: str(opts.D ?? opts.d),
        E: str(opts.E ?? opts.e),
      },
      answer: str(o.answer ?? o.correct),
      answers: Array.isArray(o.answers) ? (o.answers as unknown[]).map((x) => String(x)) : undefined,
      explanation: str(o.explanation),
    };
    const q = finalize(draft, i, errors, warnings);
    if (q) questions.push(q);
  });
  return { questions, errors, warnings };
}

function str(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  return String(v);
}

/* ---------------- CSV ---------------- */

/** Minimal CSV parser that handles quoted fields, commas, and escaped quotes. */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

export function parseCsv(raw: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const rows = parseCsvRows(raw);
  if (rows.length < 2) {
    return { questions: [], errors: ['CSV needs a header row plus at least one question row.'], warnings };
  }
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (names: string[]) => header.findIndex((h) => names.includes(h));

  const col = {
    university: idx(['university']),
    year: idx(['year']),
    subject: idx(['subject']),
    topic: idx(['topic']),
    difficulty: idx(['difficulty']),
    type: idx(['type']),
    text: idx(['text', 'question']),
    a: idx(['a', 'option a', 'optiona']),
    b: idx(['b', 'option b', 'optionb']),
    c: idx(['c', 'option c', 'optionc']),
    d: idx(['d', 'option d', 'optiond']),
    e: idx(['e', 'option e', 'optione']),
    answer: idx(['answer', 'correct']),
    explanation: idx(['explanation']),
  };

  if (col.text === -1 || col.answer === -1) {
    return {
      questions: [],
      errors: ['CSV must include at least a "text" (or "question") column and an "answer" column.'],
      warnings,
    };
  }

  const get = (r: string[], i: number) => (i >= 0 && i < r.length ? r[i] : '');
  const questions: BankQuestion[] = [];
  rows.slice(1).forEach((r, i) => {
    const draft: Draft = {
      university: get(r, col.university),
      year: get(r, col.year),
      subject: get(r, col.subject),
      topic: get(r, col.topic),
      difficulty: get(r, col.difficulty),
      type: get(r, col.type),
      text: get(r, col.text),
      options: {
        A: get(r, col.a),
        B: get(r, col.b),
        C: get(r, col.c),
        D: get(r, col.d),
        E: get(r, col.e),
      },
      answer: get(r, col.answer),
      answers: get(r, col.answer).includes(',')
        ? get(r, col.answer).split(/[,;]/).map((s) => s.trim())
        : undefined,
      explanation: get(r, col.explanation),
    };
    const q = finalize(draft, i, errors, warnings);
    if (q) questions.push(q);
  });
  return { questions, errors, warnings };
}

/* ---------------- TXT ---------------- */

/**
 * Human-friendly block format. Blocks are separated by a line of "---" or a
 * blank line. Example:
 *
 *   Subject: Mathematics
 *   Year: 2023
 *   Q: What is 2 + 2?
 *   A) 3
 *   B) 4
 *   C) 5
 *   D) 6
 *   Answer: B
 *   Explanation: Basic addition.
 */
export function parseTxt(raw: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const blocks = raw
    .split(/^\s*---+\s*$/m)
    .flatMap((b) => (b.includes('\n\n') && !/^\s*(Q:|Question:)/im.test(b.split('\n\n')[1] || '') ? [b] : [b]))
    .map((b) => b.trim())
    .filter(Boolean);

  // If no --- separators were used, split on blank lines between questions.
  const finalBlocks =
    blocks.length === 1 && /(\n\s*\n)/.test(blocks[0])
      ? blocks[0].split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
      : blocks;

  const questions: BankQuestion[] = [];
  finalBlocks.forEach((block, i) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const draft: Draft = { options: {} };
    lines.forEach((line) => {
      const meta = line.match(/^(University|Year|Subject|Topic|Difficulty|Type)\s*:\s*(.+)$/i);
      const optMatch = line.match(/^([A-E])[).:]\s*(.+)$/i);
      const qMatch = line.match(/^(Q|Question)\s*:\s*(.+)$/i);
      const ansMatch = line.match(/^Answer\s*:\s*(.+)$/i);
      const expMatch = line.match(/^Explanation\s*:\s*(.+)$/i);
      if (meta) {
        const key = meta[1].toLowerCase() as keyof Draft;
        (draft as Record<string, unknown>)[key] = meta[2].trim();
      } else if (qMatch) {
        draft.text = qMatch[2].trim();
      } else if (ansMatch) {
        const val = ansMatch[1].trim();
        const parts = val.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
        if (parts.length > 1) draft.answers = parts;
        else draft.answer = val;
      } else if (expMatch) {
        draft.explanation = expMatch[1].trim();
      } else if (optMatch) {
        const key = optMatch[1].toUpperCase() as OptionKey;
        draft.options[key] = optMatch[2].trim();
      } else if (!draft.text) {
        // First free-text line with no label is treated as the question.
        draft.text = line;
      }
    });
    const q = finalize(draft, i, errors, warnings);
    if (q) questions.push(q);
  });
  return { questions, errors, warnings };
}

export function parseByExtension(filename: string, raw: string): ParseResult {
  const ext = filename.toLowerCase().split('.').pop();
  if (ext === 'json') return parseJson(raw);
  if (ext === 'csv') return parseCsv(raw);
  return parseTxt(raw);
}
