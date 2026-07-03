import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  AlertCircle,
  Save,
  Check,
  X,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './Toast';
import type { OptionKey, Test, Attempt } from '../types';
import { calculateResult, formatTime } from '../lib/helpers';
import { getTestState, saveTestState, clearTestState } from '../lib/storage';
import { FREE_QUESTION_LIMIT, getFreeQuestionsUsed, incrementFreeQuestions } from '../lib/freeTrial';
import { Paywall } from './Paywall';

interface QuizProps {
  test: Test;
  onFinish: (attempt: Attempt) => void;
  onCancel: () => void;
  /** Premium users have no free-question limit. */
  isPremium: boolean;
  /** Current user's ID — used to persist the free-question count per account. */
  userId: string;
  /** Opens the real Paystack payment flow (from App). */
  onUpgrade: () => void;
  /** True while a Paystack payment is being processed. */
  paywallLoading?: boolean;
  priceLabel: string;
}

const RING_RADIUS = 34;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function Quiz({ test, onFinish, onCancel, isPremium, userId, onUpgrade, paywallLoading, priceLabel }: QuizProps) {
  const durationSeconds = test.durationMinutes * 60;
  const notify = useToast();

  // ── Free-trial question quota (non-premium only) ──────────────────────────
  // How many free questions this user had already used before this session.
  const [freeUsedAtStart] = useState(() => (isPremium ? 0 : getFreeQuestionsUsed(userId)));
  // Question indices answered *in this session* that counted toward the quota.
  const [answeredFreeIdx, setAnsweredFreeIdx] = useState<Set<number>>(() => new Set());
  const [showFreeLimitPaywall, setShowFreeLimitPaywall] = useState(false);
  // Total free questions used so far (persisted + this session).
  const freeUsed = freeUsedAtStart + answeredFreeIdx.size;
  const freeLimitReached = !isPremium && freeUsed >= FREE_QUESTION_LIMIT;

  // If the user pays mid-quiz, premium flips true — drop the paywall and the cap.
  useEffect(() => {
    if (isPremium) setShowFreeLimitPaywall(false);
  }, [isPremium]);

  /**
   * Guard navigation for non-premium users. Returns true if they may move to
   * `targetIndex`. Once the free quota is used up they can only revisit the
   * questions they already answered — reaching a new one opens the paywall.
   */
  function guardFreeNav(targetIndex: number): boolean {
    if (isPremium) return true;
    if (!freeLimitReached) return true;
    if (answeredFreeIdx.has(targetIndex)) return true;
    setShowFreeLimitPaywall(true);
    return false;
  }

  const [state, setState] = useState(() => {
    const saved = getTestState();
    if (saved && saved.testId === test.id) return { ...saved, visited: [saved.currentIndex] };
    return {
      testId: test.id,
      startedAt: Date.now(),
      answers: {} as Record<number, OptionKey>,
      currentIndex: 0,
      flagged: [] as number[],
      visited: [0] as number[],
    };
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = getTestState();
    const startedAt = saved && saved.testId === test.id ? saved.startedAt : Date.now();
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    return Math.max(0, durationSeconds - elapsed);
  });

  const [direction, setDirection] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answersRef = useRef(state.answers);

  useEffect(() => {
    answersRef.current = state.answers;
  }, [state.answers]);

  useEffect(() => {
    saveTestState({
      testId: state.testId,
      startedAt: state.startedAt,
      answers: state.answers,
      currentIndex: state.currentIndex,
      flagged: state.flagged,
    });
  }, [state]);

  // Auto-save toast once after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      notify('Progress auto-saved', 'success');
    }, 8000);
    return () => clearTimeout(timer);
  }, [notify]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
      const remaining = Math.max(0, durationSeconds - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        handleSubmit(true);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.startedAt, durationSeconds]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (showSubmitConfirm) return;
      const optionMap: Record<string, OptionKey> = {
        '1': 'A',
        '2': 'B',
        '3': 'C',
        '4': 'D',
        '5': 'E',
      };
      if (optionMap[e.key]) {
        selectOption(optionMap[e.key]);
      } else if (e.key === 'ArrowLeft') {
        prev();
      } else if (e.key === 'ArrowRight') {
        next();
      } else if (e.key.toLowerCase() === 'f') {
        toggleFlag(state.currentIndex);
      } else if (e.key === 'Escape') {
        setShowNavigator(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state.currentIndex, state.answers, showSubmitConfirm]);

  const answeredCount = useMemo(() => Object.keys(state.answers).length, [state.answers]);
  const visitedCount = useMemo(() => state.visited.length, [state.visited]);
  const flaggedCount = useMemo(() => state.flagged.length, [state.flagged]);

  const currentQuestion = test.questions[state.currentIndex];
  if (!currentQuestion) return null;
  const optionKeys: OptionKey[] = ['A', 'B', 'C', 'D', 'E'];
  const warning = timeLeft <= 300;
  const danger = timeLeft <= 60;

  const ringProgress = timeLeft / durationSeconds;
  const ringOffset = RING_CIRCUMFERENCE * (1 - ringProgress);

  function selectOption(key: OptionKey) {
    const idx = state.currentIndex;
    const alreadyCounted = answeredFreeIdx.has(idx);

    // Non-premium: block answering a NEW question once the free quota is used.
    if (!isPremium && !alreadyCounted && freeLimitReached) {
      setShowFreeLimitPaywall(true);
      return;
    }

    setState((s) => ({
      ...s,
      answers: { ...s.answers, [currentQuestion.id]: key },
      visited: Array.from(new Set([...s.visited, s.currentIndex])),
    }));

    // Count this question toward the free quota the first time it's answered.
    if (!isPremium && !alreadyCounted) {
      incrementFreeQuestions(userId);
      setAnsweredFreeIdx((prev) => new Set(prev).add(idx));
    }
  }

  function goTo(index: number) {
    if (!guardFreeNav(index)) return;
    setDirection(index > state.currentIndex ? 1 : -1);
    setState((s) => ({
      ...s,
      currentIndex: index,
      visited: Array.from(new Set([...s.visited, index])),
    }));
    setShowNavigator(false);
  }

  function next() {
    if (state.currentIndex < test.questions.length - 1) {
      if (!guardFreeNav(state.currentIndex + 1)) return;
      setDirection(1);
      setState((s) => ({
        ...s,
        currentIndex: s.currentIndex + 1,
        visited: Array.from(new Set([...s.visited, s.currentIndex + 1])),
      }));
    }
  }

  function prev() {
    if (state.currentIndex > 0) {
      if (!guardFreeNav(state.currentIndex - 1)) return;
      setDirection(-1);
      setState((s) => ({
        ...s,
        currentIndex: s.currentIndex - 1,
        visited: Array.from(new Set([...s.visited, s.currentIndex - 1])),
      }));
    }
  }

  function toggleFlag(index: number) {
    setState((s) => {
      const flagged = new Set(s.flagged);
      const isAdding = !flagged.has(index);
      if (isAdding) flagged.add(index);
      else flagged.delete(index);
      notify(
        isAdding ? 'Question flagged for review' : 'Flag removed',
        isAdding ? 'warning' : 'info'
      );
      return { ...s, flagged: Array.from(flagged) };
    });
  }

  function handleSubmit(force = false) {
    const currentAnswers = answersRef.current;
    const currentAnsweredCount = Object.keys(currentAnswers).length;
    const unanswered = test.questions.length - currentAnsweredCount;
    if (!force && unanswered > 0) {
      setShowSubmitConfirm(true);
      return;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    const currentTimeLeft = Math.max(0, durationSeconds - elapsed);
    const attempt = calculateResult(test, currentAnswers, currentTimeLeft);
    clearTestState();
    onFinish(attempt);
  }

  const statusPill = (idx: number) => {
    if (state.answers[test.questions[idx].id]) return 'answered';
    if (state.visited.includes(idx)) return 'visited';
    return 'unvisited';
  };

  return (
    <div className="flex min-h-screen flex-col bg-watercolor pb-20 md:pb-0">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-school-green/20 bg-white/95 shadow-sm backdrop-blur dark:border-school-green/30 dark:bg-school-navy/95">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-school-navy text-white shadow">
              <BookOpen size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-school-gold/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-school-gold">
                  RSU
                </span>
                <h1 className="text-sm font-bold text-school-navy dark:text-white sm:text-base">{test.title}</h1>
              </div>
              <p className="text-xs text-school-navy/70 dark:text-slate-400">
                Q {state.currentIndex + 1} of {test.questions.length} • {answeredCount} answered • {flaggedCount} flagged
              </p>
              {!isPremium && (
                <span
                  className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    freeLimitReached
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                      : 'bg-school-gold/15 text-school-gold'
                  }`}
                >
                  Free trial: {Math.min(freeUsed, FREE_QUESTION_LIMIT)}/{FREE_QUESTION_LIMIT} questions used
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Circular timer */}
            <div className="relative flex h-16 w-16 items-center justify-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r={RING_RADIUS} fill="none" stroke="currentColor" strokeWidth="6" className="text-school-light dark:text-school-navy/60" />
                <motion.circle
                  cx="36"
                  cy="36"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  animate={{ strokeDashoffset: ringOffset }}
                  transition={{ duration: 0.5 }}
                  className={danger ? 'text-rose-500' : warning ? 'text-amber-400' : 'text-school-green'}
                />
              </svg>
              <span className={`font-mono text-sm font-bold ${danger ? 'text-rose-600' : warning ? 'text-amber-600' : 'text-school-navy dark:text-white'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            <button
              onClick={() => setShowNavigator(true)}
              className="hidden rounded-xl border border-school-green/20 bg-white px-3 py-2 text-sm font-semibold text-school-navy shadow-sm hover:bg-school-light dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white dark:hover:bg-school-navy/40 sm:block"
            >
              Navigator
            </button>
          </div>
        </div>

        {/* Progress segments */}
        <div className="flex h-2 w-full bg-school-light dark:bg-school-navy/60">
          {test.questions.map((q, idx) => {
            const status = statusPill(idx);
            return (
              <div
                key={q.id}
                className={`flex-1 border-r border-white/30 transition-colors dark:border-school-navy/60 ${
                  status === 'answered'
                    ? 'bg-school-green'
                    : status === 'visited'
                    ? 'bg-amber-400'
                    : 'bg-transparent'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Main quiz area */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={state.currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border-l-4 border-school-green bg-white p-5 shadow-md dark:bg-school-navy/40 sm:p-8"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-school-green px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  {currentQuestion.subject}
                </span>
                <span className="rounded-full bg-school-light px-3 py-1 text-xs font-bold text-school-navy dark:bg-school-navy/60 dark:text-slate-200">
                  Q{state.currentIndex + 1}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFlag(state.currentIndex)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                  state.flagged.includes(state.currentIndex)
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-school-light text-school-navy hover:bg-school-pale dark:bg-school-navy/60 dark:text-slate-300 dark:hover:bg-school-navy/40'
                }`}
              >
                <Flag size={14} fill={state.flagged.includes(state.currentIndex) ? 'currentColor' : 'none'} />
                {state.flagged.includes(state.currentIndex) ? 'Flagged' : 'Flag'}
              </motion.button>
            </div>

            <h2 className="mb-6 text-lg font-semibold leading-relaxed text-school-navy dark:text-white sm:text-xl">
              {currentQuestion.text}
            </h2>

            <div className="space-y-3">
              {optionKeys.map((key) => {
                const selected = state.answers[currentQuestion.id] === key;
                return (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => selectOption(key)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition hover:shadow-sm ${
                      selected
                        ? 'border-school-green bg-school-green text-white shadow-md'
                        : 'border-school-green/10 bg-white hover:bg-school-light dark:border-school-green/20 dark:bg-school-navy/40 dark:text-slate-200 dark:hover:bg-school-navy/60'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                        selected ? 'bg-white/20 text-white' : 'bg-school-light text-school-navy dark:bg-school-navy/60 dark:text-slate-300'
                      }`}
                    >
                      {selected ? <Check size={18} strokeWidth={3} /> : key}
                    </span>
                    <span className="flex-1">{currentQuestion.options[key]}</span>
                    {!selected && (
                      <span className="hidden rounded bg-school-light px-1.5 py-0.5 text-[10px] font-bold text-school-navy/60 dark:bg-school-navy/60 dark:text-slate-400 sm:inline">
                        Press {key === 'A' ? '1' : key === 'B' ? '2' : key === 'C' ? '3' : key === 'D' ? '4' : '5'}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Desktop bottom nav */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 hidden flex-col-reverse items-center justify-between gap-3 md:flex md:flex-row"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="w-full rounded-xl border border-school-green/20 bg-white px-5 py-2.5 text-sm font-semibold text-school-navy shadow-sm hover:bg-school-light dark:border-school-green/30 dark:bg-school-navy/40 dark:text-slate-200 dark:hover:bg-school-navy/60 sm:w-auto"
          >
            Exit without saving
          </motion.button>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={prev}
              disabled={state.currentIndex === 0}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-school-navy shadow-sm ring-1 ring-school-green/10 hover:bg-school-light disabled:opacity-40 dark:bg-school-navy/40 dark:text-slate-200 dark:ring-school-green/20 dark:hover:bg-school-navy/60 md:flex-none"
            >
              <ChevronLeft size={18} /> Prev
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={next}
              disabled={state.currentIndex === test.questions.length - 1}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-school-navy shadow-sm ring-1 ring-school-green/10 hover:bg-school-light disabled:opacity-40 dark:bg-school-navy/40 dark:text-slate-200 dark:ring-school-green/20 dark:hover:bg-school-navy/60 md:flex-none"
            >
              Next <ChevronRight size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSubmit(false)}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-school-green px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-school-green/90 md:flex-none"
            >
              <Save size={16} /> Submit
            </motion.button>
          </div>
        </motion.div>

        {/* Mobile bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-school-green/10 bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:border-school-green/20 dark:bg-school-navy md:hidden">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
            <button
              onClick={prev}
              disabled={state.currentIndex === 0}
              className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-semibold text-school-navy disabled:opacity-40 dark:text-slate-200"
            >
              <ChevronLeft size={20} /> Prev
            </button>
            <button
              onClick={() => setShowNavigator(true)}
              className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-semibold text-school-navy dark:text-slate-200"
            >
              <BookOpen size={20} /> {answeredCount}/{test.questions.length}
            </button>
            <button
              onClick={() => toggleFlag(state.currentIndex)}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-semibold ${
                state.flagged.includes(state.currentIndex) ? 'text-amber-500' : 'text-school-navy dark:text-slate-200'
              }`}
            >
              <Flag size={20} fill={state.flagged.includes(state.currentIndex) ? 'currentColor' : 'none'} /> Flag
            </button>
            <button
              onClick={next}
              disabled={state.currentIndex === test.questions.length - 1}
              className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-semibold text-school-navy disabled:opacity-40 dark:text-slate-200"
            >
              <ChevronRight size={20} /> Next
            </button>
            <button
              onClick={() => handleSubmit(false)}
              className="flex flex-col items-center gap-0.5 rounded-lg bg-school-green px-4 py-1 text-xs font-bold text-white"
            >
              <Save size={20} /> Submit
            </button>
          </div>
        </div>
      </main>

      {/* Question navigator overlay */}
      {showNavigator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-school-navy/80 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-school-navy"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-school-navy dark:text-white">Question Navigator</h3>
                <p className="text-xs text-school-navy/70 dark:text-slate-400">
                  {answeredCount} answered • {visitedCount - answeredCount} visited • {flaggedCount} flagged
                </p>
              </div>
              <button
                onClick={() => setShowNavigator(false)}
                className="rounded-full bg-school-light p-2 text-school-navy hover:bg-school-pale dark:bg-school-navy/60 dark:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mb-4 flex flex-wrap gap-3 text-xs text-school-navy/70 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-school-green" /> Answered</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-amber-400" /> Visited</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-school-light dark:bg-school-navy/60" /> Unvisited</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-amber-100 ring-1 ring-amber-400" /> Flagged</span>
            </div>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {test.questions.map((q, idx) => {
                const answered = !!state.answers[q.id];
                const visited = state.visited.includes(idx);
                const flagged = state.flagged.includes(idx);
                const active = idx === state.currentIndex;
                return (
                  <motion.button
                    key={q.id}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => goTo(idx)}
                    className={`relative flex h-12 items-center justify-center rounded-xl text-sm font-bold transition ${
                      active
                        ? 'ring-2 ring-school-blue dark:ring-school-green'
                        : 'ring-1 ring-school-green/10 dark:ring-school-green/20'
                    } ${
                      answered
                        ? 'bg-school-green text-white'
                        : flagged
                        ? 'bg-amber-100 text-amber-700 ring-amber-300 dark:bg-amber-900/30 dark:text-amber-400'
                        : visited
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                        : 'bg-school-light text-school-navy hover:bg-school-pale dark:bg-school-navy/60 dark:text-slate-300 dark:hover:bg-school-navy/40'
                    }`}
                  >
                    {idx + 1}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Submit confirmation */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-school-navy/80 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-school-navy"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <AlertCircle size={24} />
            </div>
            <h3 className="mb-2 text-xl font-bold text-school-navy dark:text-white">Submit exam?</h3>
            <p className="mb-6 text-school-navy/80 dark:text-slate-300">
              You have answered <strong>{answeredCount}</strong> of {test.questions.length} questions.
              Unanswered questions will be marked wrong.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 rounded-xl border border-school-green/20 bg-white px-4 py-2.5 text-sm font-semibold text-school-navy hover:bg-school-light dark:border-school-green/30 dark:bg-school-navy/60 dark:text-slate-200 dark:hover:bg-school-navy/40"
              >
                Keep working
              </button>
              <button
                onClick={() => handleSubmit(true)}
                className="flex-1 rounded-xl bg-school-green px-4 py-2.5 text-sm font-bold text-white hover:bg-school-green/90"
              >
                Submit now
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Free-trial paywall — shown when a non-premium user hits the 4-question limit */}
      {showFreeLimitPaywall && !isPremium && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-school-navy/80 backdrop-blur-sm">
          <div className="flex min-h-full items-start justify-center py-6">
            <Paywall
              variant="free-limit"
              priceLabel={priceLabel}
              loading={paywallLoading}
              onUpgrade={onUpgrade}
              onHome={onCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
}
