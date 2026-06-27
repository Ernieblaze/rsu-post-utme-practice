import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Play,
  RotateCcw,
  Award,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Calendar,
  FileText,
  Timer,
  TrendingUp,
  Zap,
  Crown,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Attempt, Test } from '../types';
import {
  formatDate,
  formatTime,
  getLastAttemptForTest,
  getTestAverage,
  getTestBestScore,
} from '../lib/helpers';

interface HomeProps {
  tests: Test[];
  attempts: Attempt[];
  activeTestStateTestId: string | null;
  onStart: (testId: string) => void;
  onViewProgress: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const trustBadges = [
  { icon: <FileText size={16} />, text: '13 Real Past Papers' },
  { icon: <Timer size={16} />, text: 'Timed 30-Min Exams' },
  { icon: <CheckCircle size={16} />, text: '50 Questions Per Test' },
  { icon: <Zap size={16} />, text: 'Instant Results & Explanations' },
];

export function Home({ tests, attempts, activeTestStateTestId, onStart, onViewProgress }: HomeProps) {
  const navigate = useNavigate();
  const today = new Date().toDateString();
  const attemptedToday = attempts.filter((a) => new Date(a.date).toDateString() === today);

  const dailyTest = useMemo(() => {
    return (
      tests.find((t) => !attemptedToday.some((a) => a.testId === t.id)) || tests[0]
    );
  }, [tests, attemptedToday]);

  const average = useMemo(() => {
    if (!attempts.length) return 0;
    return Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length);
  }, [attempts]);

  const totalQuestions = useMemo(
    () => tests.reduce((sum, t) => sum + t.questions.length, 0),
    [tests]
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden rounded-3xl hero-gradient px-6 py-14 text-white shadow-2xl sm:px-12 sm:py-20"
      >
        <div className="pointer-events-none absolute inset-0 hero-glow animate-glow-pulse" />
        <div className="pointer-events-none absolute -right-10 -top-10 text-[12rem] font-black leading-none text-white/[0.04] sm:text-[16rem]">
          RSU
        </div>

        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-school-gold/40 bg-school-gold/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-school-gold backdrop-blur"
          >
            <Award size={14} />
            <span>Premium Post-UTME Simulator</span>
          </motion.div>

          <h1 className="mb-5 text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
            Ace Your RSU Post-UTME
          </h1>
          <p className="mb-6 text-lg text-white/90 sm:text-xl">
            Practice with real past questions, timed exactly like the actual screening exam.
          </p>

          <div className="mb-8 flex flex-wrap gap-3">
            {trustBadges.map((badge) => (
              <div
                key={badge.text}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur"
              >
                {badge.icon}
                {badge.text}
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onStart(dailyTest.id)}
              className="inline-flex items-center gap-2 rounded-xl bg-school-gold px-6 py-3 font-bold text-school-navy shadow-lg transition hover:bg-amber-300"
            >
              <Play size={18} fill="currentColor" />
              Start Today&apos;s Practice
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/bank')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <BookOpen size={18} />
              Build a Practice Set
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/upgrade')}
              className="inline-flex items-center gap-2 rounded-xl border border-school-gold/50 bg-transparent px-6 py-3 font-semibold text-school-gold backdrop-blur transition hover:bg-school-gold/10"
            >
              <Crown size={18} />
              Get Premium
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Quick stats */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mt-8 grid gap-4 sm:grid-cols-3"
      >
        {[
          {
            label: 'Total Attempts',
            value: attempts.length,
            icon: <TrendingUp size={20} />,
            accent: 'border-l-school-blue',
            bg: 'bg-blue-50 text-school-blue dark:bg-school-blue/20',
          },
          {
            label: 'Average Score',
            value: `${average}%`,
            icon: <Award size={20} />,
            accent: 'border-l-school-green',
            bg: 'bg-school-pale text-school-green dark:bg-school-green/20',
          },
          {
            label: 'Questions Practiced',
            value: totalQuestions,
            icon: <BookOpen size={20} />,
            accent: 'border-l-school-gold',
            bg: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className={`rounded-2xl border border-school-green/10 bg-white p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40 ${stat.accent} border-l-[4px]`}
          >
            <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg}`}>
              {stat.icon}
            </div>
            <div className="text-sm font-medium text-school-navy/70 dark:text-slate-400">{stat.label}</div>
            <div className="mt-1 text-3xl font-bold text-school-navy dark:text-white">{stat.value}</div>
          </motion.div>
        ))}
      </motion.section>

      {/* Tests list */}
      <section className="mt-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-school-navy dark:text-white">Available Exams</h2>
          <span className="text-sm font-medium text-school-navy/70 dark:text-slate-400">{tests.length} paper(s)</span>
        </div>

        {tests.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-school-gold/20 bg-school-gold/5 px-4 py-3">
            <span className="mr-1 text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">
              Jump to a paper
            </span>
            {tests.map((test) => {
              const yearLabel = test.id.startsWith('exam-year-')
                ? test.id.replace('exam-year-', '')
                : test.title;
              return (
                <motion.button
                  key={test.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onStart(test.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-school-gold/40 bg-white px-4 py-1.5 text-sm font-bold text-school-navy shadow-sm transition hover:bg-school-gold/15 dark:border-school-gold/30 dark:bg-school-navy/60 dark:text-white"
                >
                  <Calendar size={14} className="text-amber-700 dark:text-school-gold" />
                  {yearLabel}
                </motion.button>
              );
            })}
          </div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-5 md:grid-cols-2"
        >
          {tests.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              lastAttempt={getLastAttemptForTest(attempts, test.id)}
              average={getTestAverage(attempts, test.id)}
              best={getTestBestScore(attempts, test.id)}
              hasActiveState={activeTestStateTestId === test.id}
              onStart={onStart}
            />
          ))}
        </motion.div>
      </section>

      {/* Recent history preview */}
      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-school-navy dark:text-white">Recent Attempts</h2>
          <motion.button
            whileHover={{ x: 2 }}
            onClick={onViewProgress}
            className="flex items-center gap-1 text-sm font-semibold text-school-green hover:underline dark:text-school-green/80"
          >
            See all <ChevronRight size={16} />
          </motion.button>
        </div>
        {attempts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center rounded-3xl border border-dashed border-school-green/30 bg-white p-10 text-center shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
          >
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-school-light dark:bg-school-navy/60">
              <BookOpen className="text-school-green" size={40} />
            </div>
            <p className="text-lg font-bold text-school-navy dark:text-white">No attempts yet</p>
            <p className="mb-6 text-school-navy/70 dark:text-slate-400">
              Start your first practice now and track your progress over time.
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onStart(dailyTest.id)}
              className="inline-flex items-center gap-2 rounded-xl bg-school-green px-6 py-2.5 font-bold text-white shadow-md hover:bg-school-green/90"
            >
              Start your first practice now <ChevronRight size={16} />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-school-green/10 bg-white shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
          >
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-school-pale text-xs uppercase tracking-wider text-school-navy dark:bg-school-navy/60 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Exam</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-school-green/10 dark:divide-school-green/20">
                {attempts.slice(0, 5).map((a, idx) => (
                  <tr
                    key={a.id}
                    className={`hover:bg-school-light dark:hover:bg-school-navy/30 ${
                      idx % 2 === 1 ? 'bg-school-light/50 dark:bg-school-navy/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-school-navy/80 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {formatDate(a.date)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-school-navy dark:text-white">{a.testTitle}</td>
                    <td className="px-4 py-3 font-semibold text-school-navy dark:text-slate-200">
                      {a.score}/{a.total} ({a.percentage}%)
                    </td>
                    <td className="px-4 py-3">
                      <PassFailBadge percentage={a.percentage} />
                    </td>
                    <td className="px-4 py-3 text-school-navy/80 dark:text-slate-300">{formatTime(a.timeSpentSeconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </motion.div>
        )}
      </section>
    </main>
  );
}

function PassFailBadge({ percentage }: { percentage: number }) {
  const passed = percentage >= 50;
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
        passed
          ? 'bg-school-pale text-school-green dark:bg-school-green/20 dark:text-school-green'
          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
      }`}
    >
      {passed ? 'PASS' : 'FAIL'}
    </span>
  );
}

interface TestCardProps {
  test: Test;
  lastAttempt?: Attempt;
  average: number;
  best: number;
  hasActiveState: boolean;
  onStart: (id: string) => void;
}

function TestCard({ test, lastAttempt, average, best, hasActiveState, onStart }: TestCardProps) {
  const examName = test.title.replace('Rivers State Post UTME ', '');
  const completed = !!lastAttempt;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      className="relative flex flex-col overflow-hidden rounded-2xl border border-school-green/10 bg-white shadow-sm transition dark:border-school-green/20 dark:bg-school-navy/40"
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-school-navy via-school-blue to-school-green" />
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between">
          <div className="rounded-lg bg-school-pale p-2 text-school-green dark:bg-school-green/20">
            <FileText size={22} />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="rounded-full bg-school-light px-2.5 py-1 text-xs font-bold text-school-navy dark:bg-school-navy/60 dark:text-slate-300">
              {test.questions.length} Qs
            </span>
            {completed && (
              <span className="rounded-full bg-school-green/10 px-2.5 py-1 text-xs font-bold text-school-green dark:bg-school-green/20">
                Completed
              </span>
            )}
          </div>
        </div>

        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-md bg-school-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-school-gold">
            {examName}
          </span>
        </div>

        <h3 className="mb-1 text-lg font-bold text-school-navy dark:text-white">{test.title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-school-navy/80 dark:text-slate-300">{test.description}</p>

        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-school-light p-3 dark:bg-school-navy/60">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-school-navy/70 dark:text-slate-400">
              <Clock size={13} /> Duration
            </div>
            <div className="font-bold text-school-navy dark:text-white">{test.durationMinutes} mins</div>
          </div>
          <div className="rounded-xl bg-school-light p-3 dark:bg-school-navy/60">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-school-navy/70 dark:text-slate-400">
              <Award size={13} /> Best Score
            </div>
            <div className="font-bold text-school-navy dark:text-white">{best || 0}%</div>
          </div>
        </div>

        {completed && (
          <div className="mb-4 rounded-xl border border-school-green/20 bg-school-pale p-3 text-sm dark:bg-school-green/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-school-green dark:text-school-green/80">
                <CheckCircle size={16} />
                <span className="font-semibold">Last: {lastAttempt.score}/{lastAttempt.total}</span>
              </div>
              <PassFailBadge percentage={lastAttempt.percentage} />
            </div>
            <div className="mt-1 text-xs text-school-navy/70 dark:text-slate-400">{formatDate(lastAttempt.date)}</div>
          </div>
        )}

        <div className="mt-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStart(test.id)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-school-green px-4 py-2.5 font-bold text-white shadow-sm transition hover:bg-school-green/90"
          >
            {hasActiveState ? <RotateCcw size={16} /> : <Play size={16} fill="currentColor" />}
            {hasActiveState ? 'Resume / Restart' : completed ? 'Retake Exam' : 'Start Exam'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
