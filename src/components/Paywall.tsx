import { motion } from 'framer-motion';
import {
  Lock, Star, Check, Home, Zap,
  BookOpen, Target, Brain, BarChart3, Sparkles, Clock, Users,
} from 'lucide-react';

export type PaywallVariant = 'post-test' | 'revision';

interface PaywallProps {
  onUpgrade: () => void;
  onHome: () => void;
  priceLabel: string;
  loading?: boolean;
  variant?: PaywallVariant;
}

const BENEFITS = [
  {
    icon: Check,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    title: 'Full Results & Explanations',
    desc: 'See your exact score, every mistake, and a clear explanation for each question.',
  },
  {
    icon: BookOpen,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    title: 'Revision Mode',
    desc: 'Browse all 2,334+ questions by subject with answers and instant explanations.',
  },
  {
    icon: Target,
    color: 'text-school-green',
    bg: 'bg-school-pale dark:bg-school-green/10',
    title: 'Exam Focus & Customisation',
    desc: 'Personalised mock exams built around your exact JAMB subject combination.',
  },
  {
    icon: BarChart3,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    title: 'Analytics & Performance Tracking',
    desc: 'Track progress over time, spot weak subjects, and measure your improvement.',
  },
  {
    icon: Brain,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    title: 'AI Study Bot Assistant',
    desc: 'Ask the AI tutor anything and get instant, personalised study guidance.',
  },
  {
    icon: Sparkles,
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    title: 'All Subjects — incl. History, Computer Studies & IRS',
    desc: 'Full access to every current and future subject we add to the bank.',
  },
  {
    icon: Clock,
    color: 'text-school-navy dark:text-slate-200',
    bg: 'bg-school-light dark:bg-school-navy/60',
    title: '2010–2025 Past Questions + Latest Updates',
    desc: 'The most complete RSU Post-UTME question bank online — always kept current.',
  },
];

const STATS = [
  { value: '2,334+', label: 'Practice Questions' },
  { value: '12', label: 'Subjects' },
  { value: '15 yrs', label: 'Past Papers' },
];

const COPY: Record<PaywallVariant, { badge: string; headline: string; sub: string; homeLabel: string }> = {
  'post-test': {
    badge: 'Your result is waiting',
    headline: 'Unlock your score and see where you went wrong',
    sub: "You've completed the test. Upgrade to Premium to reveal your full score, subject breakdown, and detailed explanations for every question.",
    homeLabel: 'Leave without seeing results',
  },
  'revision': {
    badge: 'Premium Feature',
    headline: 'Revision Mode is for Premium students',
    sub: 'Study all 2,334+ questions by subject with instant answers and explanations. Everything you need to master RSU Post-UTME — in one place.',
    homeLabel: 'Go back',
  },
};

export function Paywall({ onUpgrade, onHome, priceLabel, loading, variant = 'post-test' }: PaywallProps) {
  const copy = COPY[variant];

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="overflow-hidden rounded-2xl border border-school-border bg-white shadow-xl dark:border-school-green/20 dark:bg-school-navy/40"
      >
        {/* ── Hero header ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-school-navy via-[#003a7a] to-school-green px-6 py-8 text-white">
          {/* decorative circles */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/5" />

          <div className="relative">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-inner ring-1 ring-white/20">
              <Lock size={26} />
            </div>

            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-school-gold/25 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-school-gold">
              <Star size={10} fill="currentColor" /> {copy.badge}
            </div>

            <h1 className="font-sora text-xl font-bold leading-snug sm:text-2xl">
              {copy.headline}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              {copy.sub}
            </p>

            {/* Stats row */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-xl bg-white/10 px-2 py-2.5 text-center ring-1 ring-white/15">
                  <div className="font-sora text-lg font-bold">{s.value}</div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-white/70">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Social proof ── */}
        <div className="flex items-center gap-2.5 border-b border-school-border bg-school-pale/60 px-6 py-3 dark:border-school-green/10 dark:bg-school-navy/60">
          <div className="flex -space-x-2">
            {['#002b5c', '#00693e', '#b8860b', '#003a7a', '#005c35'].map((c, i) => (
              <div
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white dark:border-school-navy"
                style={{ backgroundColor: c }}
              >
                {['A', 'B', 'C', 'D', 'E'][i]}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-school-navy dark:text-slate-300">
            <Users size={12} className="text-school-green" />
            Join students already passing RSU Post-UTME with Premium
          </div>
        </div>

        {/* ── Benefits list ── */}
        <div className="px-6 pt-5 pb-2">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-school-navy/50 dark:text-slate-500">
            Everything in Premium
          </p>
          <ul className="space-y-3">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <li key={b.title} className="flex items-start gap-3">
                  <span className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-lg ${b.bg} ${b.color}`}>
                    <Icon size={13} strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold text-school-navy dark:text-white">
                      {b.title}
                    </span>
                    <span className="block text-xs leading-relaxed text-school-navy/60 dark:text-slate-400">
                      {b.desc}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── Price + CTA ── */}
        <div className="px-6 pb-6 pt-5">
          <div className="mb-4 flex items-baseline gap-2">
            <span className="font-sora text-3xl font-bold text-school-navy dark:text-white">
              {priceLabel}
            </span>
            <span className="rounded-full bg-school-green/10 px-2 py-0.5 text-xs font-bold text-school-green">
              / year — one-time
            </span>
          </div>

          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            onClick={onUpgrade}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-school-green px-6 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-school-green/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Zap size={17} fill="currentColor" />
            {loading ? 'Processing payment…' : `Upgrade to Premium — ${priceLabel}`}
          </motion.button>

          <p className="mt-2 text-center text-[11px] text-school-muted">
            🔒 Secure payment via Paystack · Instant access · One year of full access
          </p>

          <button
            onClick={onHome}
            disabled={loading}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-school-green/20 bg-white px-4 py-2.5 text-sm font-semibold text-school-navy hover:bg-school-light disabled:opacity-50 dark:border-school-green/30 dark:bg-school-navy/60 dark:text-slate-200 dark:hover:bg-school-navy/40"
          >
            <Home size={14} /> {copy.homeLabel}
          </button>
        </div>
      </motion.div>
    </main>
  );
}
