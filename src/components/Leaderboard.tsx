import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Medal, Flame, Target } from 'lucide-react';
import type { Attempt } from '../types';
import { getProfile, setProfile } from '../lib/bankStorage';

interface LeaderboardProps {
  attempts: Attempt[];
  onBack: () => void;
}

/**
 * A static site has no shared server, so a true cross-user leaderboard isn't
 * possible. This ranks the attempts saved on THIS device — useful for tracking
 * your own bests and, on a shared study computer, friendly competition.
 */
export function Leaderboard({ attempts, onBack }: LeaderboardProps) {
  const [name, setName] = useState(getProfile()?.name ?? '');
  const [saved, setSaved] = useState(!!getProfile()?.name);

  const rows = useMemo(() => {
    return [...attempts]
      .sort((a, b) => b.percentage - a.percentage || b.score - a.score)
      .slice(0, 20);
  }, [attempts]);

  const stats = useMemo(() => {
    if (!attempts.length) return { best: 0, avg: 0, count: 0 };
    const best = Math.max(...attempts.map((a) => a.percentage));
    const avg = Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length);
    return { best, avg, count: attempts.length };
  }, [attempts]);

  function saveName() {
    setProfile({ name: name.trim() || 'Student' });
    setSaved(true);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <button onClick={onBack} className="mb-3 flex items-center gap-1 text-sm font-semibold text-school-green hover:underline">
        <ArrowLeft size={16} /> Back home
      </button>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-school-gold/20 text-school-gold"><Trophy size={24} /></div>
        <div>
          <h1 className="text-3xl font-extrabold text-school-navy dark:text-white">Leaderboard</h1>
          <p className="text-sm text-school-navy/60 dark:text-slate-400">Top attempts on this device</p>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard icon={<Medal size={18} />} label="Best score" value={`${stats.best}%`} />
        <StatCard icon={<Target size={18} />} label="Average" value={`${stats.avg}%`} />
        <StatCard icon={<Flame size={18} />} label="Attempts" value={String(stats.count)} />
      </div>

      <div className="mb-6 rounded-2xl border border-school-green/10 bg-white p-4 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">Your display name</label>
        <div className="flex gap-2">
          <input value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }} placeholder="e.g. Ada"
            className="flex-1 rounded-xl border border-school-green/20 bg-school-light px-3 py-2.5 text-sm text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white" />
          <button onClick={saveName} className="rounded-xl bg-school-green px-4 py-2.5 text-sm font-bold text-white hover:bg-school-green/90">{saved ? 'Saved' : 'Save'}</button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-school-green/30 bg-white p-10 text-center dark:border-school-green/20 dark:bg-school-navy/40">
          <p className="text-lg font-bold text-school-navy dark:text-white">No scores yet</p>
          <p className="text-school-navy/70 dark:text-slate-400">Finish a practice test to claim the top spot.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-school-green/10 bg-white shadow-sm dark:border-school-green/20 dark:bg-school-navy/40">
          {rows.map((a, idx) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`flex items-center gap-3 border-b border-school-green/10 px-4 py-3 last:border-0 dark:border-school-green/20 ${idx < 3 ? 'bg-school-light/60 dark:bg-school-navy/30' : ''}`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                idx === 0 ? 'bg-school-gold text-school-navy' : idx === 1 ? 'bg-slate-300 text-slate-700' : idx === 2 ? 'bg-amber-700/80 text-white' : 'bg-school-light text-school-navy dark:bg-school-navy/60 dark:text-slate-300'
              }`}>{idx + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-school-navy dark:text-white">{getProfile()?.name || 'Student'}</p>
                <p className="truncate text-xs text-school-navy/60 dark:text-slate-400">{a.testTitle}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-school-navy dark:text-white">{a.percentage}%</p>
                <p className="text-xs text-school-navy/60 dark:text-slate-400">{a.score}/{a.total}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <p className="mt-4 text-center text-xs text-school-navy/50 dark:text-slate-500">
        This ranking is saved in your browser. For a shared leaderboard across students, the app would need a backend (e.g. Supabase).
      </p>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-school-green/10 bg-white p-4 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-school-pale text-school-green dark:bg-school-green/20">{icon}</div>
      <p className="text-xs font-medium text-school-navy/60 dark:text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-school-navy dark:text-white">{value}</p>
    </div>
  );
}
