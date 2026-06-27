import type { BankQuestion, Profile } from '../types';
import { getPublishedBank } from '../data/questionBank';

const BANK_KEY = 'rsu_question_bank';
const PROFILE_KEY = 'rsu_profile';
const ADMIN_KEY = 'rsu_admin_unlocked';

/**
 * Local admin PIN for the development build. This only hides the admin screens
 * on a shared device — it is NOT real security (a static site has no server).
 * Anyone technical can read the code. Change it before sharing your repo, and
 * never treat it as protecting anything sensitive.
 */
export const ADMIN_PIN = '1234';

/** Has the admin made local edits that override the published bank? */
export function hasLocalBank(): boolean {
  try {
    return localStorage.getItem(BANK_KEY) !== null;
  } catch {
    return false;
  }
}

/** The bank currently in use: local working copy if present, else published. */
export function getBank(): BankQuestion[] {
  try {
    const raw = localStorage.getItem(BANK_KEY);
    if (raw) return JSON.parse(raw) as BankQuestion[];
  } catch {
    /* ignore */
  }
  return getPublishedBank();
}

function persist(bank: BankQuestion[]): void {
  localStorage.setItem(BANK_KEY, JSON.stringify(bank));
}

/** Reset the local working copy so this browser tracks the published bank again. */
export function resetLocalBank(): void {
  localStorage.removeItem(BANK_KEY);
}

export function genId(): string {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function addQuestion(q: BankQuestion): BankQuestion[] {
  const bank = getBank();
  const next = [{ ...q, id: q.id || genId() }, ...bank];
  persist(next);
  return next;
}

export function updateQuestion(q: BankQuestion): BankQuestion[] {
  const next = getBank().map((item) => (item.id === q.id ? q : item));
  persist(next);
  return next;
}

export function deleteQuestion(id: string): BankQuestion[] {
  const next = getBank().filter((item) => item.id !== id);
  persist(next);
  return next;
}

/**
 * Merge imported questions into the bank. Skips exact-text duplicates —
 * both against the existing bank AND against other rows in the same batch,
 * so a question repeated twice in one file only gets added once.
 */
export function addManyQuestions(items: BankQuestion[]): BankQuestion[] {
  const bank = getBank();
  const seenTexts = new Set(bank.map((q) => q.text.trim().toLowerCase()));
  const fresh: BankQuestion[] = [];
  for (const q of items) {
    const key = q.text.trim().toLowerCase();
    if (seenTexts.has(key)) continue;
    seenTexts.add(key);
    fresh.push(q);
  }
  const next = [...fresh, ...bank];
  persist(next);
  return next;
}

export function exportBankJson(): string {
  return JSON.stringify(getBank(), null, 2);
}

/* ---- Profile (for the leaderboard, this device only) ---- */

export function getProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function setProfile(p: Profile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

/* ---- Admin gate (local only) ---- */

export function isAdminUnlocked(): boolean {
  try {
    return localStorage.getItem(ADMIN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function unlockAdmin(pin: string): boolean {
  if (pin === ADMIN_PIN) {
    localStorage.setItem(ADMIN_KEY, 'true');
    return true;
  }
  return false;
}

export function lockAdmin(): void {
  localStorage.removeItem(ADMIN_KEY);
}
