import { useEffect, useRef, useState } from 'react';
import { Home, RotateCcw, BarChart3, CheckCircle, XCircle, Clock, Award, HelpCircle, ChevronDown, ChevronUp, BookOpen, Share2 } from 'lucide-react';
import { motion, animate } from 'framer-motion';
import { toPng } from 'html-to-image';
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
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'wrong'>('all');
  const [sharing, setSharing] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  async function shareScore() {
    if (!shareCardRef.current || sharing) return;
    setSharing(true);
    const siteUrl = window.location.origin;
    const caption = `I scored ${attempt.percentage}% (${attempt.score}/${attempt.total}) on my RSU Post-UTME practice! 🔥 Think you can beat me? Practice free here: ${siteUrl}`;
    try {
      const dataUrl = await toPng(shareCardRef.current, { pixelRatio: 2, cacheBust: true });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'my-rsu-score.png', { type: 'image/png' });

      // Mobile: native share sheet (WhatsApp, Facebook, etc.) with image + caption
      if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: caption });
      } else {
        // Desktop fallback: download the image and copy the caption
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'my-rsu-score.png';
        a.click();
        try { await navigator.clipboard.writeText(caption); } catch { /* ignore */ }
        window.alert('Score image downloaded! The caption was copied — paste it when you share. 🔥');
      }
    } catch {
      // User cancelling the share sheet also lands here — stay silent unless it's a real failure.
    } finally {
      setSharing(false);
    }
  }

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

  // JAMB mock only: estimate a UTME score out of 400 (each subject scored /100,
  // like the real UTME). Labelled as an estimate; RSU tests never trigger this.
  const isJamb = /jamb/i.test(test.id) || /JAMB/i.test(test.title);
  const jamb400 = isJamb
    ? attempt.subjectBreakdown.reduce((s, sb) => s + (sb.total ? Math.round((sb.correct / sb.total) * 100) : 0), 0)
    : null;

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
              {jamb400 != null && (
                <div className="mt-2 rounded-xl bg-emerald-50 px-4 py-1.5 text-center dark:bg-emerald-900/20">
                  <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">{jamb400} / 400</span>
                  <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600/80 dark:text-emerald-400/70">est. UTME score</span>
                </div>
              )}
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
                onClick={shareScore}
                disabled={sharing}
                className="flex items-center justify-center gap-2 rounded-xl bg-school-gold px-4 py-2.5 font-bold text-school-navy shadow-sm hover:opacity-90 disabled:opacity-60"
              >
                <Share2 size={16} /> {sharing ? 'Preparing…' : 'Share my score 🔥'}
              </motion.button>
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
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-school-navy dark:text-white">Review your answers</h2>
              {/* Filter: students can review everything, just the correct ones, or just the wrong ones */}
              <div className="flex gap-1 rounded-xl bg-school-light p-1 dark:bg-school-navy/60">
                {([
                  ['all', `All (${test.questions.length})`],
                  ['correct', `Correct (${correctCount})`],
                  ['wrong', `Wrong (${missedCount})`],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setReviewFilter(key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      reviewFilter === key
                        ? 'bg-school-green text-white shadow-sm'
                        : 'text-school-navy/70 hover:text-school-navy dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="max-h-[700px] space-y-4 overflow-auto pr-2">
              {test.questions.map((q, idx) => {
                const selected = attempt.selectedAnswers[q.id];
                const isCorrect = selected === q.answer;
                if (reviewFilter === 'correct' && !isCorrect) return null;
                if (reviewFilter === 'wrong' && isCorrect) return null;
                const isExpanded = expanded[q.id] ?? true;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={q.id}
                    className={`rounded-xl border p-4 ${
                      isCorrect
                        ? 'border-emerald-100 bg-emerald-50/60 dark:border-emerald-900/30 dark:bg-emerald-900/10'
                        : 'border-rose-100 bg-rose-50/60 dark:border-rose-900/30 dark:bg-rose-900/10'
                    }`}
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          isCorrect
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'
                        }`}
                      >
                        {isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">
                          <span>Q{idx + 1}</span>
                          <span className="rounded bg-school-light px-1.5 py-0.5 dark:bg-school-navy/60">{q.subject}</span>
                          <span className={isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}>
                            {isCorrect ? 'Correct' : 'Wrong'}
                          </span>
                        </div>
                        <p className="font-medium text-school-navy dark:text-white">{q.text}</p>
                      </div>
                    </div>

                    <div className="mb-3 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-lg bg-white p-3 text-sm shadow-sm dark:bg-school-navy/60">
                        <span className="block text-xs text-school-navy/60 dark:text-slate-400">Your answer</span>
                        <span className={`font-bold ${isCorrect ? 'text-school-green' : 'text-rose-600 dark:text-rose-400'}`}>
                          {selected ? `${selected}: ${q.options[selected]}` : 'Skipped'}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="rounded-lg bg-white p-3 text-sm shadow-sm dark:bg-school-navy/60">
                          <span className="block text-xs text-school-navy/60 dark:text-slate-400">Correct answer</span>
                          <span className="font-bold text-school-green">
                            {q.answer}: {q.options[q.answer]}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setExpanded((prev) => ({ ...prev, [q.id]: !(prev[q.id] ?? true) }))}
                      className="mb-2 flex items-center gap-1 text-sm font-bold text-school-blue hover:underline dark:text-school-green"
                    >
                      <HelpCircle size={16} />
                      {isExpanded ? 'Hide explanation' : 'Show explanation'}
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {isExpanded && (
                      <div className="mb-3 rounded-lg bg-white p-3 text-sm text-school-navy/80 shadow-sm dark:bg-school-navy/60 dark:text-slate-300">
                        <span className="font-semibold">Explanation:</span>{' '}
                        {q.explanation?.trim() || 'No detailed explanation for this question yet — the correct answer is shown above.'}
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
              {reviewFilter === 'wrong' && missedCount === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 py-12 text-center dark:bg-emerald-900/20">
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                    <Award size={32} />
                  </div>
                  <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Perfect score!</p>
                  <p className="text-emerald-700/80 dark:text-emerald-400/80">You answered every question correctly.</p>
                </div>
              )}
              {reviewFilter === 'correct' && correctCount === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl bg-school-light py-12 text-center dark:bg-school-navy/60">
                  <p className="text-lg font-bold text-school-navy dark:text-white">No correct answers this time</p>
                  <p className="text-school-navy/70 dark:text-slate-400">Switch to “Wrong” to study what to improve.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Hidden shareable score card — rendered off-screen, snapshotted to PNG.
          Uses inline hex colours so html-to-image renders it reliably. */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, pointerEvents: 'none' }} aria-hidden>
        <div
          ref={shareCardRef}
          style={{
            width: 540,
            height: 540,
            background: 'linear-gradient(150deg, #002b5c 0%, #003f7a 55%, #046a38 100%)',
            color: '#ffffff',
            fontFamily: 'Inter, system-ui, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 44,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(212,175,55,0.5)',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: -0.5 }}>RSU</span>
              <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: 1.5, color: '#d4af37' }}>POST-UTME</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.5 }}>RSU Post-UTME Practice</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#d4af37' }}>
              {band.label} — {band.message}
            </div>
            <div style={{ fontSize: 128, fontWeight: 800, lineHeight: 1, margin: '6px 0' }}>
              {attempt.percentage}%
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
              {attempt.score} / {attempt.total} correct
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>Think you can beat me? 🔥</div>
            <div
              style={{
                display: 'inline-block', background: '#d4af37', color: '#002b5c',
                fontSize: 16, fontWeight: 800, padding: '10px 22px', borderRadius: 999,
              }}
            >
              rsu-post-utme-practice.vercel.app
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
