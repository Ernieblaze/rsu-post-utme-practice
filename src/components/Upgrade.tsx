import { motion } from 'framer-motion';
import { ArrowLeft, Check, Star } from 'lucide-react';

interface UpgradeProps {
  onBack: () => void;
  onUpgrade: () => void;
  priceLabel: string;
}

const PERKS = [
  'Unlimited timed tests across every past paper',
  'Full question bank and revision mode',
  'Progress tracking and leaderboard',
  'One full year of access',
];

export function Upgrade({ onBack, onUpgrade, priceLabel }: UpgradeProps) {
  return (
    <div className="mx-auto max-w-lg px-4 py-5">
      <button
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-2 rounded-xl border border-school-border bg-white px-3 py-1.5 text-sm font-semibold text-school-navy shadow-sm transition hover:bg-school-light"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden rounded-2xl border border-school-border bg-white shadow-sm"
      >
        <div className="bg-gradient-to-br from-school-navy to-school-green px-6 py-5 text-white">
          <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
            <Star size={12} /> Premium Access
          </div>
          <h1 className="font-sora text-2xl font-bold">Unlock full practice</h1>
          <p className="mt-1 max-w-md text-sm text-white/80">
            You've used your free test. Upgrade to keep practicing with every past paper.
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="mb-4 flex items-baseline gap-2">
            <span className="font-sora text-3xl font-bold text-school-navy">{priceLabel}</span>
            <span className="text-sm text-school-muted">/ year</span>
          </div>

          <ul className="mb-5 space-y-2">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5 text-sm text-school-navy">
                <span className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-school-green/15 text-school-green">
                  <Check size={10} strokeWidth={3} />
                </span>
                <span>{perk}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={onUpgrade}
            className="w-full rounded-xl bg-school-green px-6 py-3 text-center text-base font-bold text-white shadow-sm transition hover:opacity-90"
          >
            Upgrade Now
          </button>
          <p className="mt-2 text-center text-xs text-school-muted">
            Secure payment. One year of access, then renew.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
