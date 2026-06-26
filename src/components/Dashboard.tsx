import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  Target,
  BookOpen,
  CheckCircle2,
  Crown,
  Gift,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAccessStatus, isSubscriptionActive } from '../lib/access';
import { getAttempts } from '../lib/storage';
import type { Attempt } from '../types';

interface DashboardProps {
  onBack: () => void;
  onUpgrade: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

interface SubjectStat {
  subject: string;
  correct: number;
  total: number;
  accuracy: number;
}

function aggregateSubjects(attempts: Attempt[]): SubjectStat[] {
  const map = new Map<string, { correct: number; total: number }>();
  for (const a of attempts) {
    for (const sb of a.subjectBreakdown) {
      const cur = map.get(sb.subject) ?? { correct: 0, total: 0 };
      cur.correct += sb.correct;
      cur.total += sb.total;
      map.set(sb.subject, cur);
    }
  }
  return Array.from(map.entries())
    .map(([subject, v]) => ({
      subject,
      correct: v.correct,
      total: v.total,
      accuracy: v.total ? Math.round((v.correct / v.total) * 100) : 0,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);
}

export function Dashboard({ onBack, onUpgrade }: DashboardProps) {
  const { user, profile } = useAuth();
  const reduceMotion = useReducedMotion();

  const attempts = useMemo(() => getAttempts(), []);

  const stats = useMemo(() => {
    const totalTests = attempts.length;
    const questionsAnswered = attempts.reduce((s, a) => s + a.total, 0);
    const average = totalTests
      ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / totalTests)
      : 0;
    const best = totalTests ? Math.max(...attempts.map((a) => a.percentage)) : 0;
    return { totalTests, questionsAnswered, average, best };
  }, [attempts]);

  const subjects = useMemo(() => aggregateSubjects(attempts), [attempts]);
  const recent = useMemo(() => attempts.slice(0, 8).slice().reverse(), [attempts]);

  const status = getAccessStatus(profile);
  const active = isSubscriptionActive(profile);

  let statusLabel = 'No active subscription';
  if (status === 'admin') statusLabel = 'Admin access';
  else if (status === 'paid') statusLabel = `Active until ${formatDate(profile?.paid_until ?? null)}`;
  else if (status === 'free-available') statusLabel = 'Free trial available';

  const greetingName = user?.email ? user.email.split('@')[0] : 'there';

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 rounded-xl border border-school-border bg-school-surface px-4 py-2 text-sm font-semibold text-school-navy shadow-sm hover:bg-school-light dark:border-school-green/20 dark:bg-school-navy/40 dark:text-slate-200 dark:hover:bg-school-navy/60"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="section-heading font-sora text-2xl font-bold text-school-navy dark:text-white">
        Welcome back, {greetingName}
      </h1>
      <p className="mt-1 text-school-muted">Here's how your preparation is going.</p>

      {/* Account / subscription */}
      <motion.section
        variants={itemVariants}
        initial={reduceMotion ? false : 'hidden'}
        animate="show"
        className="mt-6 flex flex-col gap-4 rounded-2xl border border-school-border bg-school-surface p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-school-pale text-school-green dark:bg-school-green/20">
            <Crown size={22} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-school-muted">Account</div>
            <div className="font-sora text-lg font-semibold text-school-navy dark:text-white">
              {user?.email ?? 'Signed in'}
            </div>
            <div className="text-sm text-school-muted">{statusLabel}</div>
          </div>
        </div>
        {!active && status !== 'admin' && (
          <button
            onClick={onUpgrade}
            className="rounded-xl bg-school-green px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
          >
            {status === 'free-available' ? 'Upgrade Now' : 'Renew Access'}
          </button>
        )}
      </motion.section>

      {/* Analytics */}
      {stats.totalTests === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-school-border bg-school-light p-10 text-center dark:border-school-green/20 dark:bg-school-navy/30">
          <TrendingUp className="mx-auto mb-4 text-school-green" size={48} />
          <p className="text-lg text-school-navy dark:text-slate-200">No analytics yet.</p>
          <p className="text-school-muted">Complete a test and your performance will show up here.</p>
        </div>
      ) : (
        <>
          <motion.section
            variants={container}
            initial={reduceMotion ? false : 'hidden'}
            animate="show"
            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <StatCard icon={<Trophy size={20} />} label="Tests completed" value={String(stats.totalTests)} />
            <StatCard icon={<BookOpen size={20} />} label="Questions answered" value={String(stats.questionsAnswered)} />
            <StatCard icon={<TrendingUp size={20} />} label="Average score" value={`${stats.average}%`} />
            <StatCard icon={<Target size={20} />} label="Best score" value={`${stats.best}%`} />
          </motion.section>

          {/* Recent trend */}
          <motion.section
            variants={itemVariants}
            initial={reduceMotion ? false : 'hidden'}
            animate="show"
            className="mt-8 rounded-2xl border border-school-border bg-school-surface p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
          >
            <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">Recent scores</h2>
            <div className="mt-5 flex h-40 items-end gap-2">
              {recent.map((a) => (
                <div key={a.id} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <div
                    className="w-full rounded-t-md bg-school-green/80"
                    style={{ height: `${Math.max(a.percentage, 4)}%` }}
                    title={`${a.testTitle}: ${a.percentage}%`}
                  />
                  <span className="text-[10px] font-medium text-school-muted">{a.percentage}%</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Per-subject performance */}
          <motion.section
            variants={itemVariants}
            initial={reduceMotion ? false : 'hidden'}
            animate="show"
            className="mt-8 rounded-2xl border border-school-border bg-school-surface p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-school-green" />
              <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">
                Subject performance
              </h2>
            </div>
            <div className="mt-5 space-y-4">
              {subjects.map((s) => (
                <div key={s.subject}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold text-school-navy dark:text-slate-100">{s.subject}</span>
                    <span className="font-medium text-school-muted">
                      {s.correct}/{s.total} ({s.accuracy}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-school-light dark:bg-school-navy/60">
                    <motion.div
                      initial={reduceMotion ? {} : { width: 0 }}
                      animate={{ width: `${s.accuracy}%` }}
                      transition={{ duration: reduceMotion ? 0 : 0.5 }}
                      className={`h-full rounded-full ${
                        s.accuracy < 40 ? 'bg-rose-500' : s.accuracy < 70 ? 'bg-amber-400' : 'bg-school-green'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </>
      )}

      {/* Referral + Balance (read-only for now) */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <motion.section
          variants={itemVariants}
          initial={reduceMotion ? false : 'hidden'}
          animate="show"
          className="rounded-2xl border border-school-border bg-school-surface p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
        >
          <div className="flex items-center gap-2">
            <Gift size={18} className="text-school-green" />
            <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">Refer & earn</h2>
          </div>
          <p className="mt-2 text-sm text-school-muted">
            Your personal referral code is being set up. You'll be able to share it and earn when friends upgrade.
          </p>
          <div className="mt-3 inline-flex rounded-lg bg-school-light px-3 py-2 font-mono text-sm text-school-muted dark:bg-school-navy/60">
            Coming soon
          </div>
        </motion.section>

        <motion.section
          variants={itemVariants}
          initial={reduceMotion ? false : 'hidden'}
          animate="show"
          className="rounded-2xl border border-school-border bg-school-surface p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
        >
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-school-green" />
            <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">Balance</h2>
          </div>
          <div className="mt-2 font-sora text-3xl font-bold text-school-navy dark:text-white">₦0.00</div>
          <p className="mt-1 text-sm text-school-muted">Withdrawals open once referrals launch.</p>
        </motion.section>
      </div>
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
