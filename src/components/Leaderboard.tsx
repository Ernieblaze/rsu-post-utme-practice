import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Medal, Flame, Target, Crown } from 'lucide-react';
import type { Attempt } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

interface LeaderboardProps {
  attempts: Attempt[];
  onBack: () => void;
}

interface LeaderRow {
  user_id: string;
  username: string | null;
  best_percentage: number;
  best_score: number;
  best_total: number;
  test_title: string | null;
  attempts_count: number;
}

// Only real, full-length exams count toward the global ranking, so a short quiz
// with a lucky 100% can't top serious exam-takers.
const MIN_QUESTIONS = 40;

/**
 * The GLOBAL leaderboard — ranks every student across the platform by their best
 * full-length exam score, read live from Supabase via the get_leaderboard RPC.
 * Students appear by their display name (username); anyone without one shows as
 * an anonymous student (emails are never exposed here). The "Your practice
 * stats" band still reflects this device's own history.
 */
export function Leaderboard({ attempts, onBack }: LeaderboardProps) {
  const { user, profile } = useAuth();
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .rpc('get_leaderboard', { limit_n: 20, min_total: MIN_QUESTIONS })
      .then(({ data, error: rpcError }) => {
        if (cancelled) return;
        setLoading(false);
        if (rpcError) { setError(rpcError.message); return; }
        setError(null);
        if (Array.isArray(data)) setRows(data as LeaderRow[]);
      });
    return () => { cancelled = true; };
  }, []);

  // Personal practice stats from this device (still useful, always accurate).
  const stats = useMemo(() => {
    if (!attempts.length) return { best: 0, avg: 0, count: 0 };
    const best = Math.max(...attempts.map((a) => a.percentage));
    const avg = Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length);
    return { best, avg, count: attempts.length };
  }, [attempts]);

  const myRank = useMemo(
    () => (user ? rows.findIndex((r) => r.user_id === user.id) : -1),
    [rows, user]
  );
  const loggedInNoName = !!user && !profile?.username;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 rounded-xl border border-school-border bg-school-surface px-4 py-2 text-sm font-semibold text-school-navy shadow-sm hover:bg-school-light dark:border-school-green/20 dark:bg-school-navy/40 dark:text-slate-200 dark:hover:bg-school-navy/60"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-school-gold/20 text-amber-700 dark:text-school-gold"><Trophy size={24} /></div>
        <div>
          <h1 className="text-3xl font-extrabold text-school-navy dark:text-white">Leaderboard</h1>
          <p className="text-sm text-school-navy/60 dark:text-slate-400">Top students across the whole platform — by best exam score</p>
        </div>
      </div>

      {/* Your own practice stats (this device) */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard icon={<Medal size={18} />} label="Your best" value={`${stats.best}%`} />
        <StatCard icon={<Target size={18} />} label="Your average" value={`${stats.avg}%`} />
        <StatCard icon={<Flame size={18} />} label="Your attempts" value={String(stats.count)} />
      </div>

      {loggedInNoName && (
        <div className="mb-6 rounded-2xl border border-school-gold/40 bg-school-gold/10 px-4 py-3 text-sm text-school-navy dark:border-school-gold/30 dark:text-slate-200">
          <strong>Set a display name</strong> to show up on the leaderboard by name — add it on your Dashboard. Without one you appear as an anonymous student.
        </div>
      )}

      {error ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm dark:border-amber-500/40 dark:bg-amber-500/10">
          <p className="font-semibold text-amber-700 dark:text-amber-400">The global leaderboard isn't set up yet.</p>
          <p className="mt-1 text-school-navy/70 dark:text-slate-300">Run the one-time <code className="rounded bg-white/60 px-1 dark:bg-black/20">get_leaderboard</code> SQL in Supabase and it will start ranking students automatically.</p>
        </div>
      ) : loading ? (
        <div className="rounded-2xl border border-school-green/10 bg-white p-8 text-center text-sm text-school-navy/60 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40 dark:text-slate-400">Loading rankings…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-school-green/30 bg-white p-10 text-center dark:border-school-green/20 dark:bg-school-navy/40">
          <p className="text-lg font-bold text-school-navy dark:text-white">No ranked scores yet</p>
          <p className="text-school-navy/70 dark:text-slate-400">Be the first — finish a full exam ({MIN_QUESTIONS}+ questions) to claim the top spot.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-school-green/10 bg-white shadow-sm dark:border-school-green/20 dark:bg-school-navy/40">
          {rows.map((r, idx) => {
            const isMe = !!user && r.user_id === user.id;
            return (
              <motion.div
                key={r.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`flex items-center gap-3 border-b border-school-green/10 px-4 py-3 last:border-0 dark:border-school-green/20 ${
                  isMe ? 'bg-school-green/10 dark:bg-school-green/15' : idx < 3 ? 'bg-school-light/60 dark:bg-school-navy/30' : ''
                }`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  idx === 0 ? 'bg-school-gold text-school-navy' : idx === 1 ? 'bg-slate-300 text-slate-700' : idx === 2 ? 'bg-amber-700/80 text-white' : 'bg-school-light text-school-navy dark:bg-school-navy/60 dark:text-slate-300'
                }`}>{idx + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-school-navy dark:text-white">
                    {r.username || 'Anonymous student'}
                    {isMe && <span className="ml-1.5 rounded-full bg-school-green px-1.5 py-0.5 text-[10px] font-bold text-white">You</span>}
                  </p>
                  <p className="truncate text-xs text-school-navy/60 dark:text-slate-400">{r.test_title ?? 'Exam'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-school-navy dark:text-white">{Math.round(r.best_percentage)}%</p>
                  <p className="text-xs text-school-navy/60 dark:text-slate-400">{r.best_score}/{r.best_total}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {!error && !loading && rows.length > 0 && user && !profile?.is_admin && myRank === -1 && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-school-green/10 bg-white px-4 py-3 text-sm text-school-navy/70 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40 dark:text-slate-300">
          <Crown size={15} className="text-school-gold" />
          You're not in the top 20 yet — finish a full exam and beat {Math.round(rows[rows.length - 1].best_percentage)}% to break in.
        </div>
      )}

      <p className="mt-4 text-center text-xs text-school-navy/50 dark:text-slate-500">
        Ranked by each student's single best full exam ({MIN_QUESTIONS}+ questions). Updates live as students finish tests.
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
