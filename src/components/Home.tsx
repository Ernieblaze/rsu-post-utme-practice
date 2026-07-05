import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Award,
  BookOpen,
  ChevronRight,
  Calendar,
  Layers,
  Target,
  GraduationCap,
  Timer,
  TrendingUp,
  Zap,
  Crown,
  HelpCircle,
  Sparkles,
  Gift,
  Star,
} from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Chidinma O.',
    course: 'Nursing Science',
    initials: 'CO',
    quote:
      'The Exam Focus mode felt exactly like the real screening — timed, my exact subjects, everything. I walked in confident and it paid off.',
  },
  {
    name: 'Emeka N.',
    course: 'Computer Science',
    initials: 'EN',
    quote:
      'What I enjoyed most is that every question has a full explanation. I stopped just cramming and actually understood — my score jumped fast.',
  },
  {
    name: 'Blessing A.',
    course: 'Economics',
    initials: 'BA',
    quote:
      'The free question of the day kept me consistent, and the past questions are really on point. Best ₦2,000 I spent for my admission.',
  },
];

const LEADERBOARD = [
  { name: 'Emeka N.', amount: 15000 },
  { name: 'Favour A.', amount: 10000 },
  { name: 'David O.', amount: 5500 },
];
import { motion } from 'framer-motion';
import type { Attempt } from '../types';
import { formatDate, formatTime } from '../lib/helpers';

interface HomeProps {
  attempts: Attempt[];
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
  { icon: <Layers size={16} />, text: 'Questions Organized by Department' },
  { icon: <Timer size={16} />, text: 'Timed Mock Exams' },
  { icon: <Target size={16} />, text: 'Personalized to Your Course' },
  { icon: <Zap size={16} />, text: 'Instant Results & Explanations' },
];

export function Home({ attempts, onViewProgress }: HomeProps) {
  const navigate = useNavigate();

  const best = useMemo(() => {
    if (!attempts.length) return 0;
    return Math.max(...attempts.map((a) => a.percentage));
  }, [attempts]);

  const average = useMemo(() => {
    if (!attempts.length) return 0;
    return Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length);
  }, [attempts]);

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
            Practice with questions organized by department, personalized to your exact course.
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
              onClick={() => navigate('/exam-focus')}
              className="inline-flex items-center gap-2 rounded-xl bg-school-gold px-6 py-3 font-bold text-school-navy shadow-lg transition hover:bg-amber-300"
            >
              <Play size={18} fill="currentColor" />
              Start Exam Focus
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

      {/* New here? Guide banner */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        onClick={() => navigate('/guide')}
        className="mt-6 flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-school-green/20 bg-school-pale px-5 py-4 text-left shadow-sm transition hover:bg-school-pale/70 dark:border-school-green/30 dark:bg-school-green/10 dark:hover:bg-school-green/15"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-school-green text-white">
            <HelpCircle size={20} />
          </span>
          <span>
            <span className="block font-sora font-bold text-school-navy dark:text-white">New here?</span>
            <span className="block text-sm text-school-navy/70 dark:text-slate-300">
              See how to use the platform — from signing up to passing your exam.
            </span>
          </span>
        </span>
        <span className="flex items-center gap-1 text-sm font-semibold text-school-green">
          Read the guide <ChevronRight size={16} />
        </span>
      </motion.button>

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
            label: 'Best Score',
            value: `${best}%`,
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

      {/* Exam Focus / Practice / Revision */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="mt-12 space-y-5"
      >
        <SectionPromoCard
          icon={<Target size={26} />}
          eyebrow="Flagship feature"
          title="Exam Focus"
          description="A personalized mock exam built around your exact course — your JAMB subjects, Current Affairs, and RSU General Knowledge, fully timed."
          cta="Start Exam Focus"
          onClick={() => navigate('/exam-focus')}
          accent="bg-school-green text-white"
        />
        <SectionPromoCard
          icon={<Layers size={26} />}
          eyebrow="Customize it"
          title="Practice"
          description="Pick which subjects and topics to drill, choose how many questions, and practice timed or untimed."
          cta="Build a Practice Set"
          onClick={() => navigate('/bank')}
          accent="bg-school-blue text-white"
        />
        <SectionPromoCard
          icon={<GraduationCap size={26} />}
          eyebrow="Study calmly"
          title="Revision"
          description="Browse and study questions for your course, filtered by subject and topic, with explanations right there."
          cta="Go to Revision"
          onClick={() => navigate('/revision')}
          accent="bg-school-gold text-school-navy"
        />
        <SectionPromoCard
          icon={<Sparkles size={26} />}
          eyebrow="New"
          badge="Premium"
          title="AI Study Helper"
          description="Stuck on something confusing in any subject? Ask the AI tutor for a clear, simple explanation, anytime."
          cta="Ask the AI Tutor"
          onClick={() => navigate('/ai-tutor')}
          accent="bg-purple-600 text-white"
        />
        <SectionPromoCard
          icon={<Calendar size={26} />}
          eyebrow="Free daily"
          badge="Free"
          title="Question of the Day"
          description="A fresh free question every single day, picked for your course. Answer it, see the explanation instantly — build your daily habit."
          cta="Answer Today's Question"
          onClick={() => navigate('/daily')}
          accent="bg-school-gold text-school-navy"
        />
      </motion.section>

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
              Start with Exam Focus and track your progress over time.
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/exam-focus')}
              className="inline-flex items-center gap-2 rounded-xl bg-school-green px-6 py-2.5 font-bold text-white shadow-md hover:bg-school-green/90"
            >
              Start Exam Focus <ChevronRight size={16} />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-school-green/10 bg-white shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
          >
            {/* Mobile card list */}
            <div className="divide-y divide-school-green/10 sm:hidden dark:divide-school-green/20">
              {attempts.slice(0, 5).map((a) => (
                <div key={a.id} className="space-y-1.5 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 flex-1 truncate font-medium text-school-navy dark:text-white">{a.testTitle}</span>
                    <PassFailBadge percentage={a.percentage} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-school-navy dark:text-slate-200">
                      {a.score}/{a.total} ({a.percentage}%)
                    </span>
                    <span className="text-school-navy/70 dark:text-slate-400">{formatTime(a.timeSpentSeconds)}</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-school-navy/60 dark:text-slate-400">
                    <Calendar size={12} />
                    {formatDate(a.date)}
                  </span>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
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

      {/* Testimonials */}
      <section className="mt-14">
        <h2 className="text-center font-sora text-2xl font-bold text-school-navy dark:text-white">
          What students are saying
        </h2>
        <p className="mx-auto mt-1 mb-6 max-w-md text-center text-sm text-school-muted">
          Real practice, real confidence for the RSU Post-UTME.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-school-green/10 bg-white p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
            >
              <div className="mb-2 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className="text-school-gold" fill="currentColor" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-school-navy/80 dark:text-slate-300">"{t.quote}"</p>
              <div className="mt-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-school-green/15 text-xs font-bold text-school-green">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-school-navy dark:text-white">{t.name}</p>
                  <p className="text-xs text-school-muted">{t.course}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Referral earnings leaderboard */}
      <section className="mt-14 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-3xl border border-school-gold/30 bg-gradient-to-br from-school-navy via-[#003a7a] to-school-green p-6 text-white shadow-lg sm:p-8"
        >
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-school-gold/25 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-school-gold">
            <Gift size={13} /> Earn while you prepare
          </div>
          <h2 className="font-sora text-2xl font-bold leading-snug">
            As you prepare for your Post-UTME, earn money for data 💸
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85">
            Refer your friends to the app and earn <strong className="text-school-gold">₦500</strong> for every one who
            subscribes to Premium. Once you reach ₦5,000, you can <strong>withdraw directly to your bank</strong>.
          </p>

          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-school-gold">🏆 Top referrers</p>
            <div className="space-y-2">
              {LEADERBOARD.map((r, i) => (
                <div key={r.name} className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-school-gold text-sm font-extrabold text-school-navy">
                      {i + 1}
                    </span>
                    <span className="font-semibold">{r.name}</span>
                  </div>
                  <span className="font-sora font-bold text-school-gold">₦{r.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard')}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-school-gold px-6 py-3 font-bold text-school-navy shadow-sm hover:opacity-90 sm:w-auto"
          >
            <Gift size={17} /> Start referring &amp; earning →
          </motion.button>
        </motion.div>
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

function SectionPromoCard({
  icon,
  eyebrow,
  title,
  description,
  cta,
  onClick,
  accent,
  badge,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
  accent: string;
  badge?: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3 }}
      className="flex flex-col gap-4 rounded-2xl border border-school-green/10 bg-white p-6 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-4">
        <div className={`flex h-14 w-14 flex-none items-center justify-center rounded-2xl ${accent}`}>{icon}</div>
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-school-navy/50 dark:text-slate-500">{eyebrow}</span>
          <div className="flex items-center gap-2">
            <h2 className="font-sora text-xl font-bold text-school-navy dark:text-white">{title}</h2>
            {badge && (
              <span className="rounded-full bg-school-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-school-gold">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-1 max-w-md text-sm text-school-navy/70 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="flex flex-none items-center justify-center gap-2 rounded-xl bg-school-green px-5 py-2.5 font-bold text-white shadow-sm hover:bg-school-green/90 sm:w-auto"
      >
        {cta} <ChevronRight size={16} />
      </motion.button>
    </motion.div>
  );
}

