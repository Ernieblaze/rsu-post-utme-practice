import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Users, Crown, Wallet, TrendingUp, LayoutDashboard, FileText, Rocket,
  ArrowRight, CheckCircle2, Clock, ExternalLink,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { EXAMS } from '../config/admitme';

interface AdmitMeHQProps {
  onBack: () => void;
}

interface Snapshot {
  users: number;
  premium: number;
  revenue: number;
  signupsToday: number;
  signups7: number;
}

/**
 * AdmitMe HQ — the platform command center. A single admin-only station that
 * shows a live snapshot of the whole platform (one shared account + payment
 * base, so this covers every exam) and links to every admin tool + section.
 * Reads the existing Supabase data — no new backend.
 */
export function AdmitMeHQ({ onBack }: AdmitMeHQProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      supabase.from('profiles').select('id, has_paid, created_at'),
      supabase.from('transactions').select('amount, status').eq('status', 'success'),
    ]).then(([usersRes, txRes]) => {
      if (cancelled) return;
      if (usersRes.error) {
        setError(usersRes.error.message);
        setLoading(false);
        return;
      }
      const users = usersRes.data ?? [];
      const tx = txRes.data ?? [];
      const now = Date.now();
      const startOfToday = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      setSnap({
        users: users.length,
        premium: users.filter((u) => u.has_paid).length,
        revenue: tx.reduce((s, t) => s + (t.amount ?? 0), 0) / 100,
        signupsToday: users.filter((u) => new Date(u.created_at).getTime() >= startOfToday).length,
        signups7: users.filter((u) => new Date(u.created_at).getTime() >= weekAgo).length,
      });
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const tiles = useMemo(() => snap ? [
    { label: 'Total users', value: snap.users.toLocaleString(), icon: Users, accent: '#4f46e5' },
    { label: 'Premium users', value: snap.premium.toLocaleString(), icon: Crown, accent: '#f59e0b' },
    { label: 'Revenue', value: `₦${snap.revenue.toLocaleString()}`, icon: Wallet, accent: '#10b981' },
    { label: 'Signups (7 days)', value: `${snap.signups7}`, sub: `${snap.signupsToday} today`, icon: TrendingUp, accent: '#1d4ed8' },
  ] : [], [snap]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
          <Rocket size={24} />
        </div>
        <div>
          <h1 className="font-sora text-2xl font-bold text-slate-900">AdmitMe HQ 🎛️</h1>
          <p className="text-sm text-slate-500">Your platform command center — everything, in one place.</p>
        </div>
      </div>

      {/* Snapshot */}
      <section className="mb-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Platform snapshot</p>
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-600">Couldn't load data: {error}</div>
        ) : loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />)}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tiles.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: t.accent }}>
                    <Icon size={20} />
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">{t.value}</div>
                  <div className="text-xs font-semibold text-slate-500">{t.label}{t.sub ? ` · ${t.sub}` : ''}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Exams */}
      <section className="mb-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Exams & sections</p>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {EXAMS.map((e, i) => (
            <div key={e.id} className={`flex items-center gap-3 px-5 py-4 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
              <span className="h-3 w-3 flex-none rounded-full" style={{ background: e.accent }} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{e.name}</p>
                {e.school && <p className="truncate text-xs text-slate-500">{e.school}</p>}
              </div>
              {e.status === 'live' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700"><CheckCircle2 size={10} /> Live</span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700"><Clock size={10} /> Coming soon</span>
              )}
              {e.path && (
                <button onClick={() => navigate(e.path!)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
                  View <ExternalLink size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">Switching a section live/coming-soon needs one small Supabase table (later) — for now it's code-controlled.</p>
      </section>

      {/* Admin tools */}
      <section>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Admin tools</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <ToolCard icon={LayoutDashboard} title="People & Money" body="Users, payments, revenue, grant/revoke premium, exports, traffic & email quota." accent="#4f46e5" onClick={() => navigate('/owner')} />
          <ToolCard icon={FileText} title="Question Manager" body="Add, edit and manage the question bank." accent="#10b981" onClick={() => navigate('/admin')} />
          <ToolCard icon={Rocket} title="View AdmitMe" body="See the platform exactly as your students do." accent="#7c3aed" onClick={() => navigate('/admitme')} />
        </div>
      </section>
    </main>
  );
}

function ToolCard({ icon: Icon, title, body, accent, onClick }: { icon: typeof Users; title: string; body: string; accent: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ background: accent }}>
        <Icon size={22} />
      </div>
      <h3 className="font-sora font-bold text-slate-900">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-slate-500">{body}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold" style={{ color: accent }}>Open <ArrowRight size={15} /></span>
    </button>
  );
}
