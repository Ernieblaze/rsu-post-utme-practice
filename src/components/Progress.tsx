import { ArrowLeft, Trash2, Trophy, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Attempt } from '../types';
import { formatDateTime, formatTime, overallWeakAreas } from '../lib/helpers';

interface ProgressProps {
  attempts: Attempt[];
  onBack: () => void;
  onClear: () => void;
}

const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export function Progress({ attempts, onBack, onClear }: ProgressProps) {
  const reduceMotion = useReducedMotion();
  const totalTests = attempts.length;
  const average = totalTests
    ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / totalTests)
    : 0;
  const best = totalTests ? Math.max(...attempts.map((a) => a.percentage)) : 0;
  const weak = overallWeakAreas(attempts);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 rounded-xl border border-school-border bg-school-surface px-4 py-2 text-sm font-semibold text-school-navy shadow-sm hover:bg-school-light dark:border-school-green/20 dark:bg-school-navy/40 dark:text-slate-200 dark:hover:bg-school-navy/60"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="section-heading font-sora text-2xl font-bold text-school-navy dark:text-white">
        Your Progress
      </h1>

      {totalTests === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-school-border bg-school-light p-10 text-center dark:border-school-green/20 dark:bg-school-navy/30">
          <TrendingUp className="mx-auto mb-4 text-school-green" size={48} />
          <p className="text-lg text-school-navy dark:text-slate-200">No attempts yet.</p>
          <p className="text-school-muted">Complete a test to start tracking your progress.</p>
        </div>
      ) : (
        <>
          <motion.section
            variants={container}
            initial={reduceMotion ? false : 'hidden'}
            animate="show"
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <StatCard icon={<Trophy size={20} />} label="Tests taken" value={String(totalTests)} />
            <StatCard icon={<TrendingUp size={20} />} label="Average score" value={`${average}%`} />
            <StatCard icon={<Trophy size={20} />} label="Best score" value={`${best}%`} />
            <StatCard icon={<AlertCircle size={20} />} label="Weak area" value={weak[0]?.subject || 'N/A'} />
          </motion.section>

          <motion.section
            variants={itemVariants}
            initial={reduceMotion ? false : 'hidden'}
            animate="show"
            className="mt-8 rounded-2xl border border-school-border bg-school-surface p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
          >
            <h2 className="section-heading font-sora text-2xl font-bold text-school-navy dark:text-white">
              Weak Areas
            </h2>
            <div className="mt-5 space-y-4">
              {weak.map((w) => (
                <div key={w.subject}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold text-school-navy dark:text-slate-100">{w.subject}</span>
                    <span className="font-medium text-school-muted">
                      {w.correct}/{w.total} ({w.accuracy}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-school-light dark:bg-school-navy/60">
                    <motion.div
                      initial={reduceMotion ? {} : { width: 0 }}
                      animate={{ width: `${w.accuracy}%` }}
                      transition={{ duration: reduceMotion ? 0 : 0.5 }}
                      className={`h-full rounded-full ${
                        w.accuracy < 40 ? 'bg-rose-500' : w.accuracy < 70 ? 'bg-amber-400' : 'bg-school-green'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            initial={reduceMotion ? false : 'hidden'}
            animate="show"
            className="mt-8 rounded-2xl border border-school-border bg-school-surface shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
          >
            <div className="flex items-center justify-between border-b border-school-border px-5 py-4 dark:border-school-green/20">
              <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">Attempt History</h2>
              <button
                onClick={onClear}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
              >
                <Trash2 size={16} /> Clear
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-school-pale text-xs font-bold uppercase tracking-widest text-school-navy dark:bg-school-navy/60 dark:text-slate-300">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Test</th>
                    <th className="px-5 py-3">Score</th>
                    <th className="px-5 py-3">%</th>
                    <th className="px-5 py-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-school-border dark:divide-school-green/20">
                  {attempts.slice(0, 20).map((a) => (
                    <tr key={a.id} className="hover:bg-school-light dark:hover:bg-school-navy/30">
                      <td className="px-5 py-3 text-school-muted">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {formatDateTime(a.date)}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium text-school-navy dark:text-white">{a.testTitle}</td>
                      <td className="px-5 py-3 font-semibold text-school-navy dark:text-slate-200">
                        {a.score}/{a.total}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            a.percentage >= 60
                              ? 'bg-school-pale text-school-green dark:bg-school-green/20 dark:text-school-green'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          }`}
                        >
                          {a.percentage}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-school-muted">{formatTime(a.timeSpentSeconds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>
        </>
      )}
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      variants={itemVariants}
      initial={reduceMotion ? false : undefined}
      whileHover={reduceMotion ? {} : { y: -4 }}
      className="card rounded-2xl border border-school-border bg-school-surface p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-school-pale text-school-green dark:bg-school-green/20">
        {icon}
      </div>
      <div className="text-xs font-bold uppercase tracking-widest text-school-muted">{label}</div>
      <div className="mt-1 font-sora text-2xl font-bold text-school-navy dark:text-white">{value}</div>
    </motion.div>
  );
}
