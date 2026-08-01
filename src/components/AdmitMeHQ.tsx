import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Crown, Wallet, TrendingUp, FileText, ArrowRight, CheckCircle2, Clock,
  ExternalLink, Activity, LayoutGrid, Gift, Newspaper, SlidersHorizontal, Sun, Moon,
  ArrowUpRight, Sparkles, Home,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { EXAMS } from '../config/admitme';
import { useAdmitMeTheme } from './admitme/useAdmitMeTheme';

interface AdmitMeHQProps {
  onBack: () => void;
}

interface Snapshot { users: number; premium: number; revenue: number; signupsToday: number; signups7: number; }
interface LiveRow { user_id: string; email: string | null; username: string | null; action: string | null; updated_at: string; }

const A = '#4F46E5';        // AdmitMe admin accent (parent-brand indigo)
const A_HOVER = '#4338CA';
const EASE = [0.16, 1, 0.3, 1] as const;
const soft = (pct: number) => `color-mix(in srgb, ${A} ${pct}%, transparent)`;

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'questions', label: 'Questions', icon: FileText },
  { id: 'users', label: 'Users & Money', icon: Wallet },
  { id: 'referrals', label: 'Referrals', icon: Gift },
  { id: 'content', label: 'Content', icon: Newspaper },
  { id: 'config', label: 'Config', icon: SlidersHorizontal },
] as const;

function timeAgo(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

/**
 * AdmitMe Admin Console — the single, AdmitMe-branded command center for the whole
 * platform (one shared account + payment base covers every exam). Phase 0 = the
 * unified shell: Overview is fully live; the other tabs scaffold Phases 1–5 and
 * link to the existing tools (/admin, /owner) so nothing is lost meanwhile.
 */
export function AdmitMeHQ({ onBack }: AdmitMeHQProps) {
  const navigate = useNavigate();
  const { theme, toggle } = useAdmitMeTheme();
  const [tab, setTab] = useState<string>('overview');

  const [loading, setLoading] = useState(true);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [recent, setRecent] = useState<{ email: string | null; created_at: string }[]>([]);
  const [live, setLive] = useState<LiveRow[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Live activity — who's active in the last 5 minutes, polled every 25s.
  useEffect(() => {
    let cancelled = false;
    function load() {
      supabase.rpc('get_live_activity', { minutes: 5 }).then(({ data, error: rpcError }) => {
        if (cancelled) return;
        setLiveLoading(false);
        if (rpcError) { setLiveError(rpcError.message); return; }
        setLiveError(null);
        if (Array.isArray(data)) setLive(data as LiveRow[]);
      });
    }
    load();
    const id = setInterval(load, 25000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      supabase.from('profiles').select('id, email, has_paid, created_at'),
      supabase.from('transactions').select('amount, status').eq('status', 'success'),
    ]).then(([usersRes, txRes]) => {
      if (cancelled) return;
      if (usersRes.error) { setError(usersRes.error.message); setLoading(false); return; }
      const users = usersRes.data ?? [];
      setRecent(
        [...users].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 8).map((u) => ({ email: u.email, created_at: u.created_at }))
      );
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
    { label: 'Total users', value: snap.users.toLocaleString(), icon: Users, accent: A },
    { label: 'Premium', value: snap.premium.toLocaleString(), icon: Crown, accent: '#F59E0B' },
    { label: 'Revenue', value: `₦${snap.revenue.toLocaleString()}`, icon: Wallet, accent: '#10B981' },
    { label: 'Signups · 7d', value: `${snap.signups7}`, sub: `${snap.signupsToday} today`, icon: TrendingUp, accent: '#0EA5E9' },
  ] : [], [snap]);

  const fade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.3, ease: EASE } };

  return (
    <div className="admitme-app" style={{ ['--primary' as string]: A, ['--primary-hover' as string]: A_HOVER, minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Top bar ── */}
      <header className="mt-glass sticky top-0 z-50" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="mt-display flex h-8 w-8 items-center justify-center rounded-lg text-base font-extrabold text-white" style={{ background: A }}>A</span>
            <span className="mt-display hidden text-base font-extrabold sm:inline" style={{ color: 'var(--text)' }}>Admit<span style={{ color: A }}>Me</span></span>
            <span className="mt-label rounded-md px-2 py-0.5 text-[10px] font-bold" style={{ background: soft(14), color: A }}>ADMIN</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={toggle} aria-label="Toggle theme" className="mt-btn mt-btn-secondary" style={{ padding: '0.45rem', width: '2.35rem', height: '2.35rem' }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }} className="flex items-center justify-center">
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </motion.span>
              </AnimatePresence>
            </button>
            <button onClick={() => navigate('/')} className="mt-btn mt-btn-secondary hidden sm:inline-flex" style={{ fontSize: '.85rem' }}><ExternalLink size={15} /> View site</button>
            <button onClick={onBack} className="mt-btn text-white" style={{ background: A, fontSize: '.85rem', padding: '.5rem 1rem' }}><Home size={15} /> Home</button>
          </div>
        </div>
      </header>

      {/* ── Tab bar ── */}
      <div className="sticky top-[3.25rem] z-40 mt-glass" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 py-2">
          {TABS.map((t) => {
            const on = tab === t.id;
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className="mt-body relative flex flex-none items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors" style={on ? { background: A, color: '#fff' } : { color: 'var(--text-muted)' }}>
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <AnimatePresence mode="wait">
          {/* ═══ OVERVIEW ═══ */}
          {tab === 'overview' && (
            <motion.div key="overview" {...fade}>
              {/* Snapshot tiles */}
              {error ? (
                <div className="mt-card p-4 text-sm font-semibold" style={{ color: '#e11d48' }}>Couldn't load data: {error}</div>
              ) : loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl" style={{ background: 'var(--surface-2)' }} />)}</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {tiles.map((t) => {
                    const Icon = t.icon;
                    return (
                      <div key={t.label} className="mt-card p-5" style={{ boxShadow: 'var(--mt-shadow-sm)' }}>
                        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: t.accent }}><Icon size={20} /></span>
                        <div className="mt-mono text-2xl font-extrabold" style={{ color: 'var(--text)' }}>{t.value}</div>
                        <div className="mt-label text-[11px]" style={{ color: 'var(--text-muted)' }}>{t.label}{t.sub ? ` · ${t.sub}` : ''}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Live now */}
              <div className="mt-8">
                <p className="mt-label mb-3 flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${live.length > 0 ? 'animate-ping' : ''}`} style={{ background: '#34D399' }} />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: live.length > 0 ? '#10B981' : 'var(--border)' }} />
                  </span>
                  Live now{live.length > 0 ? ` · ${live.length} active` : ''}
                </p>
                <div className="mt-card overflow-hidden p-0">
                  {liveError ? (
                    <div className="px-5 py-5 text-sm">
                      <p className="mt-body font-semibold" style={{ color: '#b45309' }}>Live activity isn't set up yet.</p>
                      <p className="mt-body mt-1" style={{ color: 'var(--text-muted)' }}>Run the one-time SQL (the <code className="rounded px-1" style={{ background: 'var(--surface-2)' }}>user_activity</code> table + <code className="rounded px-1" style={{ background: 'var(--surface-2)' }}>get_live_activity</code> function) in Supabase.</p>
                    </div>
                  ) : liveLoading ? (
                    <div className="px-5 py-6 text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</div>
                  ) : live.length === 0 ? (
                    <div className="flex items-center gap-3 px-5 py-6 text-sm" style={{ color: 'var(--text-muted)' }}><Activity size={16} className="flex-none" /> No one active in the last 5 minutes — lights up in real time.</div>
                  ) : (
                    live.map((r, i) => (
                      <div key={r.user_id} className="flex items-center gap-3 px-5 py-3" style={i > 0 ? { borderTop: '1px solid var(--border)' } : undefined}>
                        <Activity size={16} className="flex-none" style={{ color: '#10B981' }} />
                        <div className="min-w-0 flex-1">
                          <p className="mt-body truncate text-sm font-semibold" style={{ color: 'var(--text)' }}>{r.username || r.email?.split('@')[0] || 'Someone'}</p>
                          <p className="mt-body truncate text-xs" style={{ color: 'var(--text-muted)' }}>{r.action ?? 'Using the app'}</p>
                        </div>
                        <span className="mt-body flex-none text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(r.updated_at)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent signups */}
              {recent.length > 0 && (
                <div className="mt-8">
                  <p className="mt-label mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>Recent signups</p>
                  <div className="mt-card overflow-hidden p-0">
                    {recent.map((r, i) => (
                      <div key={`${r.email}-${i}`} className="flex items-center gap-3 px-5 py-3" style={i > 0 ? { borderTop: '1px solid var(--border)' } : undefined}>
                        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-xs font-bold uppercase" style={{ background: soft(14), color: A }}>{r.email?.[0] ?? '?'}</span>
                        <span className="mt-body min-w-0 flex-1 truncate text-sm font-medium" style={{ color: 'var(--text)' }}>{r.email ?? '(no email)'}</span>
                        <span className="mt-body flex-none text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick tools */}
              <div className="mt-8">
                <p className="mt-label mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>Quick tools</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <ToolCard icon={FileText} title="Question Manager" body="Add, edit & import questions (RSU bank today; multi-exam next)." onClick={() => navigate('/admin')} />
                  <ToolCard icon={Wallet} title="People & Money" body="Users, payments, premium, payouts, exports & traffic." onClick={() => navigate('/owner')} />
                  <ToolCard icon={Sparkles} title="View AdmitMe" body="See the platform exactly as your students do." onClick={() => navigate('/')} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ QUESTIONS ═══ */}
          {tab === 'questions' && (
            <motion.div key="questions" {...fade}>
              <ScaffoldTab
                icon={FileText} phase="Phase 1"
                title="Question banks — every exam"
                body="A single manager for JAMB, WAEC and each Post-UTME school's bank: pick exam → subject → add / edit / import, with a gap-finder showing thin subjects."
                planned={['Pick exam → subject → CRUD', 'Per-bank CSV / JSON import', 'Counts per subject + gap finder', 'Bulk explanations backfill']}
                cta={{ label: 'Open current Question Manager', onClick: () => navigate('/admin') }}
                note="Today's manager edits the RSU bank only — that becomes multi-exam here in Phase 1."
              />
            </motion.div>
          )}

          {/* ═══ USERS & MONEY ═══ */}
          {tab === 'users' && (
            <motion.div key="users" {...fade}>
              <ScaffoldTab
                icon={Wallet} phase="Phase 2"
                title="Users & money"
                body="Search users, grant / revoke premium, see revenue and the 'paid-but-not-premium' fixer, plus traffic, email quota and CSV exports — restyled into this console."
                planned={['User search + grant/revoke premium', 'Revenue + paid-but-not-premium fixer', 'Traffic, email quota, growth', 'CSV email exports']}
                cta={{ label: 'Open People & Money', onClick: () => navigate('/owner') }}
                note="Fully working today at /owner — Phase 2 brings it into this console's look."
              />
            </motion.div>
          )}

          {/* ═══ REFERRALS ═══ */}
          {tab === 'referrals' && (
            <motion.div key="referrals" {...fade}>
              <ScaffoldTab
                icon={Gift} phase="Phase 3"
                title="Referrals & payouts"
                body="Referral balances, the payout-request queue, and one-tap 'mark as paid' — so processing a payout takes seconds."
                planned={['Referral leaderboard + balances', 'Payout-request queue', 'Mark-as-paid + history']}
                cta={{ label: 'Open payouts (in People & Money)', onClick: () => navigate('/owner') }}
                note="Payouts live inside /owner today; Phase 3 gives them their own focused queue."
              />
            </motion.div>
          )}

          {/* ═══ CONTENT ═══ */}
          {tab === 'content' && (
            <motion.div key="content" {...fade}>
              <ScaffoldTab
                icon={Newspaper} phase="Phase 4"
                title="Content — news & explanations"
                body="Post real news per exam (replacing the 'coming soon' placeholders on the exam pages) and run the explanations backfill for questions that don't have one yet."
                planned={['Post / edit news per exam', 'Publish → shows on the exam News tab', 'Explanations backfill queue']}
              />
            </motion.div>
          )}

          {/* ═══ CONFIG ═══ */}
          {tab === 'config' && (
            <motion.div key="config" {...fade}>
              <div className="mb-6">
                <span className="mt-label inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: soft(14), color: A }}>Phase 5</span>
                <h2 className="mt-display mt-2 text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Exams & sections</h2>
                <p className="mt-body mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Live status is code-controlled for now — Phase 5 makes these toggles data-driven.</p>
              </div>
              <div className="mt-card overflow-hidden p-0">
                {EXAMS.map((e, i) => (
                  <div key={e.id} className="flex items-center gap-3 px-5 py-4" style={i > 0 ? { borderTop: '1px solid var(--border)' } : undefined}>
                    <span className="h-3 w-3 flex-none rounded-full" style={{ background: e.accent }} />
                    <div className="min-w-0 flex-1">
                      <p className="mt-body font-semibold" style={{ color: 'var(--text)' }}>{e.name}</p>
                      {e.school && <p className="mt-body truncate text-xs" style={{ color: 'var(--text-muted)' }}>{e.school}</p>}
                    </div>
                    {e.status === 'live'
                      ? <span className="mt-label inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" style={{ background: 'color-mix(in srgb, #10b981 16%, transparent)', color: '#059669' }}><CheckCircle2 size={10} /> Live</span>
                      : <span className="mt-label inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" style={{ background: 'color-mix(in srgb, #f59e0b 18%, transparent)', color: '#b45309' }}><Clock size={10} /> Soon</span>}
                    {e.path && (
                      <button onClick={() => navigate(e.path!)} className="mt-btn mt-btn-secondary" style={{ fontSize: '.8rem', padding: '.35rem .75rem' }}>View <ExternalLink size={12} /></button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ToolCard({ icon: Icon, title, body, onClick }: { icon: typeof Users; title: string; body: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="mt-card group flex flex-col p-5 text-left transition-transform hover:-translate-y-1" style={{ boxShadow: 'var(--mt-shadow-sm)' }}>
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ background: A }}><Icon size={20} /></span>
      <h3 className="mt-display text-base font-bold" style={{ color: 'var(--text)' }}>{title}</h3>
      <p className="mt-body mt-1 flex-1 text-sm" style={{ color: 'var(--text-muted)' }}>{body}</p>
      <span className="mt-body mt-3 inline-flex items-center gap-1 text-sm font-bold transition-transform group-hover:gap-1.5" style={{ color: A }}>Open <ArrowRight size={15} /></span>
    </button>
  );
}

function ScaffoldTab({ icon: Icon, phase, title, body, planned, cta, note }: { icon: typeof Users; phase: string; title: string; body: string; planned: string[]; cta?: { label: string; onClick: () => void }; note?: string }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mt-card p-8 text-center" style={{ boxShadow: 'var(--mt-shadow)' }}>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: soft(14), color: A }}><Icon size={28} /></span>
        <span className="mt-label mt-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: soft(14), color: A }}>{phase} · Coming to this console</span>
        <h2 className="mt-display mt-3 text-2xl font-extrabold" style={{ color: 'var(--text)' }}>{title}</h2>
        <p className="mt-body mx-auto mt-2 max-w-md text-sm" style={{ color: 'var(--text-muted)' }}>{body}</p>

        <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left">
          {planned.map((p) => (
            <li key={p} className="mt-body flex items-start gap-2 text-sm" style={{ color: 'var(--text)' }}>
              <CheckCircle2 size={16} className="mt-0.5 flex-none" style={{ color: A }} /> {p}
            </li>
          ))}
        </ul>

        {cta && (
          <button onClick={cta.onClick} className="mt-btn mt-7 text-white" style={{ background: A }}>{cta.label} <ArrowUpRight size={16} /></button>
        )}
        {note && <p className="mt-body mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>{note}</p>}
      </div>
    </div>
  );
}
