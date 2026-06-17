import { useEffect, useState } from 'react';
import { Home, RotateCcw, BarChart3, CheckCircle, XCircle, Clock, Award, HelpCircle, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { motion, animate } from 'framer-motion';
import type { Attempt, Test } from '../types';
import { formatTime, performanceBand, subjectColor } from '../lib/helpers';

interface ResultsProps {
  attempt: Attempt;
  test: Test;
  onRetake: () => void;
  onHome: () => void;
  onProgress: () => void;
  onReviseSubject: (subject: string) => void;
}

export function Results({ attempt, test, onRetake, onHome, onProgress, onReviseSubject }: ResultsProps) {
  const [displayedScore, setDisplayedScore] = useState(0);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const controls = animate(0, attempt.score, {
      duration: 1.5,
      onUpdate: (v) => setDisplayedScore(Math.round(v)),
    });
    return () => controls.stop();
  }, [attempt.score]);

  const band = performanceBand(attempt.percentage);
  const passed = attempt.percentage >= 50;

  const missed = test.questions.filter((q) => attempt.selectedAnswers[q.id] !== q.answer);
  const missedCount = missed.length;
  const correctCount = test.questions.length - missedCount;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Score card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <div className="rounded-3xl border border-school-green/10 bg-white p-6 shadow-md dark:border-school-green/20 dark:bg-school-navy/40">
            <div className="mb-6 flex flex-col items-center">
              <div className="relative mb-3 flex h-48 w-48 items-center justify-center">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 144 144">
                  <path
                    className="text-school-light dark:text-school-navy/60"
                    d="M72 8 a 64 64 0 0 1 0 128 a 64 64 0 0 1 0 -128"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                  />
                  <motion.path
                    initial={{ strokeDasharray: '0, 402' }}
                    animate={{ strokeDasharray: `${(attempt.percentage / 100) * 402}, 402` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className={passed ? 'text-school-green' : 'text-rose-500'}
                    d="M72 8 a 64 64 0 0 1 0 128 a 64 64 0 0 1 0 -128"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center">
                  <div className="text-5xl font-bold text-school-navy dark:text-white">{displayedScore}</div>
                  <div className="text-base font-medium text-school-navy/60 dark:text-slate-400">/ {attempt.total}</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-school-navy dark:text-white">{attempt.percentage}%</div>
              <div className={`mt-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${band.color}`}>
                {band.label} — {band.message}
              </div>
              <div className={`mt-1 text-sm font-semibold ${passed ? 'text-school-green' : 'text-rose-500'}`}>
                {passed ? 'PASS' : 'FAIL'}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-school-light p-3 dark:bg-school-navy/60">
                <span className="flex items-center gap-2 text-school-navy/70 dark:text-slate-400">
                  <Clock size={16} /> Time used
                </span>
                <span className="font-bold text-school-navy dark:text-white">{formatTime(attempt.timeSpentSeconds)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-school-light p-3 dark:bg-school-navy/60">
                <span className="flex items-center gap-2 text-school-navy/70 dark:text-slate-400">
                  <CheckCircle size={16} /> Correct
                </span>
                <span className="font-bold text-school-green">{correctCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-school-light p-3 dark:bg-school-navy/60">
                <span className="flex items-center gap-2 text-school-navy/70 dark:text-slate-400">
                  <XCircle size={16} /> Wrong / Skipped
                </span>
                <span className="font-bold text-rose-500">{missedCount}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRetake}
                className="flex items-center justify-center gap-2 rounded-xl bg-school-green px-4 py-2.5 font-bold text-white hover:bg-school-green/90"
              >
                <RotateCcw size={16} /> Retake this exam
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onProgress}
                className="flex items-center justify-center gap-2 rounded-xl border border-school-green/20 bg-white px-4 py-2.5 font-semibold text-school-navy hover:bg-school-light dark:border-school-green/30 dark:bg-school-navy/60 dark:text-slate-200 dark:hover:bg-school-navy/40"
              >
                <BarChart3 size={16} /> View progress
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onHome}
                className="flex items-center justify-center gap-2 rounded-xl border border-school-green/20 bg-white px-4 py-2.5 font-semibold text-school-navy hover:bg-school-light dark:border-school-green/30 dark:bg-school-navy/60 dark:text-slate-200 dark:hover:bg-school-navy/40"
              >
                <Home size={16} /> Back home
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Subject breakdown & review */}
        <div className="space-y-6 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-school-green/10 bg-white p-5 shadow-md dark:border-school-green/20 dark:bg-school-navy/40"
          >
            <h2 className="mb-4 text-lg font-bold text-school-navy dark:text-white">Subject Breakdown</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {attempt.subjectBreakdown.map((s, idx) => {
                const pct = Math.round((s.correct / s.total) * 100);
                return (
                  <div
                    key={s.subject}
                    className="rounded-xl border border-school-green/10 bg-school-light p-4 dark:border-school-green/20 dark:bg-school-navy/60"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${subjectColor(idx)}`} />
                        <span className="font-semibold text-school-navy dark:text-slate-100">{s.subject}</span>
                      </div>
                      <span className="text-sm font-bold text-school-navy dark:text-white">{pct}%</span>
                    </div>
                    <div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-white dark:bg-school-navy/40">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: idx * 0.1 }}
                        className={`h-full rounded-full ${subjectColor(idx)}`}
                      />
                    </div>
                    <div className="text-xs text-school-navy/70 dark:text-slate-400">
                      {s.correct}/{s.total} correct
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-school-green/10 bg-white p-5 shadow-md dark:border-school-green/20 dark:bg-school-navy/40"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-school-navy dark:text-white">
                {missedCount === 0 ? 'Review questions' : `Missed questions (${missedCount})`}
              </h2>
              <span className="rounded-full bg-school-light px-3 py-1 text-xs font-semibold text-school-navy dark:bg-school-navy/60 dark:text-slate-300">
                {missedCount === 0 ? 'All correct!' : 'Study these explanations'}
              </span>
            </div>
            <div className="max-h-[700px] space-y-4 overflow-auto pr-2">
              {test.questions.map((q, idx) => {
                const selected = attempt.selectedAnswers[q.id];
                const isCorrect = selected === q.answer;
                if (isCorrect) return null;
                const isExpanded = expanded[q.id] ?? true;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={q.id}
                    className="rounded-xl border border-rose-100 bg-rose-50/60 p-4 dark:border-rose-900/30 dark:bg-rose-900/10"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400">
                        <XCircle size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">
                          <span>Q{idx + 1}</span>
                          <span className="rounded bg-school-light px-1.5 py-0.5 dark:bg-school-navy/60">{q.subject}</span>
                        </div>
                        <p className="font-medium text-school-navy dark:text-white">{q.text}</p>
                      </div>
                    </div>

                    <div className="mb-3 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-lg bg-white p-3 text-sm shadow-sm dark:bg-school-navy/60">
                        <span className="block text-xs text-school-navy/60 dark:text-slate-400">Your answer</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {selected ? `${selected}: ${q.options[selected]}` : 'Skipped'}
                        </span>
                      </div>
                      <div className="rounded-lg bg-white p-3 text-sm shadow-sm dark:bg-school-navy/60">
                        <span className="block text-xs text-school-navy/60 dark:text-slate-400">Correct answer</span>
                        <span className="font-bold text-school-green">
                          {q.answer}: {q.options[q.answer]}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpanded((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                      className="mb-2 flex items-center gap-1 text-sm font-bold text-school-blue hover:underline dark:text-school-green"
                    >
                      <HelpCircle size={16} />
                      {isExpanded ? 'Hide explanation' : 'Show explanation'}
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {isExpanded && (
                      <div className="mb-3 rounded-lg bg-white p-3 text-sm text-school-navy/80 shadow-sm dark:bg-school-navy/60 dark:text-slate-300">
                        <span className="font-semibold">Explanation:</span> {q.explanation}
                      </div>
                    )}

                    <button
                      onClick={() => onReviseSubject(q.subject)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-school-light px-3 py-1.5 text-xs font-bold text-school-navy hover:bg-school-pale dark:bg-school-navy/60 dark:text-slate-200 dark:hover:bg-school-navy/40"
                    >
                      <BookOpen size={14} /> Revise {q.subject}
                    </button>
                  </motion.div>
                );
              })}
              {missedCount === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 py-12 text-center dark:bg-emerald-900/20">
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                    <Award size={32} />
                  </div>
                  <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Perfect score!</p>
                  <p className="text-emerald-700/80 dark:text-emerald-400/80">You answered every question correctly.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
