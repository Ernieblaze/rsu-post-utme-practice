import type { Attempt, ActiveTestState } from '../types';

const SCORES_KEY = 'rsu_practice_scores';
const TEST_STATE_KEY = 'rsu_practice_test_state';
const DARK_KEY = 'rsu_practice_dark';

export function getAttempts(): Attempt[] {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    return raw ? (JSON.parse(raw) as Attempt[]) : [];
  } catch {
    return [];
  }
}

export function saveAttempt(attempt: Attempt): void {
  const attempts = getAttempts();
  attempts.unshift(attempt);
  // Keep last 100 attempts
  localStorage.setItem(SCORES_KEY, JSON.stringify(attempts.slice(0, 100)));
}

export function clearAttempts(): void {
  localStorage.removeItem(SCORES_KEY);
}

export function getTestState(): ActiveTestState | null {
  try {
    const raw = localStorage.getItem(TEST_STATE_KEY);
    return raw ? (JSON.parse(raw) as ActiveTestState) : null;
  } catch {
    return null;
  }
}

export function saveTestState(state: ActiveTestState | null): void {
  if (state) {
    localStorage.setItem(TEST_STATE_KEY, JSON.stringify(state));
  } else {
    localStorage.removeItem(TEST_STATE_KEY);
  }
}

export function clearTestState(): void {
  localStorage.removeItem(TEST_STATE_KEY);
}

export function getDarkMode(): boolean {
  try {
    const raw = localStorage.getItem(DARK_KEY);
    return raw ? raw === 'true' : false;
  } catch {
    return false;
  }
}

export function setDarkMode(value: boolean): void {
  localStorage.setItem(DARK_KEY, String(value));
}
