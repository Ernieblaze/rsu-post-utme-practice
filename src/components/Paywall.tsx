import { motion } from 'framer-motion';
import { Lock, Star, Check, Home, Zap } from 'lucide-react';

interface PaywallProps {
  onUpgrade: () => void;
  onHome: () => void;
  priceLabel: string;
  loading?: boolean;
}

const PERKS = [
  'Unlock your score and see every question you got wrong',
  'Full explanations for every missed question',
  'Unlimited timed tests across all past papers (1992–2024)',
  'Subject-by-subject performance breakdown',
  'Full question bank and revision mode',
  'Progress tracking and performance history',
  'Leaderboard and competitive ranking',
  'AI Study Helper for personalized guidance',
  'One full year of unrestricted access',
];

export function Paywall({ onUpgrade, onHome, priceLabel, loading }: PaywallProps) {
  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden rounded-2xl border border-school-border bg-white shadow-xl dark:border-school-green/20 dark:bg-school-navy/40"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-school-navy via-school-navy to-school-green px-6 py-7 text-white">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 shadow-inner">
            <Lock size={30} />
          </div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">
            <Star size={11} fill="currentColor" /> Premium Required
          </div>
          <h1 className="font-sora text-2xl font-bold leading-snug">
            Your result is ready — unlock it now
          </h1>
          <p className="mt-2 text-sm text-white/80 leading-relaxed">
            You've completed the test. Upgrade to Premium to see your score, full explanations,
            and gain unlimited access to all practice materials.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <div className="mb-5 flex items-baseline gap-2">
            <span className="font-sora text-3xl font-bold text-school-navy dark:text-white">
              {priceLabel}
            </span>
            <span className="text-sm text-school-muted">/ year</span>
          </div>

          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-school-navy/50 dark:text-slate-400">
            Everything included
          </p>
          <ul className="mb-6 space-y-2.5">
            {PERKS.map((perk) => (
              <li
                key={perk}
                className="flex items-start gap-2.5 text-sm text-school-navy dark:text-slate-200"
              >
                <span className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-school-green/15 text-school-green">
                  <Check size={10} strokeWidth={3} />
                </span>
                <span>{perk}</span>
              </li>
            ))}
          </ul>

          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            onClick={onUpgrade}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-school-green px-6 py-3.5 text-center text-base font-bold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Zap size={17} fill="currentColor" />
            {loading ? 'Processing payment…' : `Upgrade to Premium — ${priceLabel}`}
          </motion.button>
          <p className="mt-2 text-center text-xs text-school-muted">
            Secure payment via Paystack · One year of full access
          </p>

          <button
            onClick={onHome}
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-school-green/20 bg-white px-4 py-2.5 text-sm font-semibold text-school-navy hover:bg-school-light disabled:opacity-50 dark:border-school-green/30 dark:bg-school-navy/60 dark:text-slate-200 dark:hover:bg-school-navy/40"
          >
            <Home size={15} /> Go home without seeing results
          </button>
        </div>
      </motion.div>
    </main>
  );
}
