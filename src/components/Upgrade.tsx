import { ArrowLeft } from 'lucide-react';
import { Paywall } from './Paywall';

interface UpgradeProps {
  onBack: () => void;
  onUpgrade: () => void;
  priceLabel: string;
  loading?: boolean;
}

export function Upgrade({ onBack, onUpgrade, priceLabel, loading }: UpgradeProps) {
  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-10">
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-2 rounded-xl border border-school-border bg-white px-3 py-1.5 text-sm font-semibold text-school-navy shadow-sm transition hover:bg-school-light dark:border-school-green/20 dark:bg-school-navy/40 dark:text-slate-200 dark:hover:bg-school-navy/60"
      >
        <ArrowLeft size={16} /> Back
      </button>
      <Paywall
        variant="upgrade"
        priceLabel={priceLabel}
        loading={loading}
        onUpgrade={onUpgrade}
        onHome={onBack}
      />
    </div>
  );
}
