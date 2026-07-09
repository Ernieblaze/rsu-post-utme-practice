import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  Target,
  BookOpen,
  CheckCircle2,
  Crown,
  Gift,
  Wallet,
  Copy,
  Send,
  AtSign,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAccessStatus, isSubscriptionActive } from '../lib/access';
import { getAttempts } from '../lib/storage';
import { supabase } from '../lib/supabaseClient';
import { generateReferralCode, buildReferralLink } from '../lib/referral';
import type { Attempt } from '../types';

interface WithdrawalRow {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
}

interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface DashboardProps {
  onBack: () => void;
  onUpgrade: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const MIN_WITHDRAWAL_KOBO = 500000; // ₦5,000

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

interface SubjectStat {
  subject: string;
  correct: number;
  total: number;
  accuracy: number;
}

function aggregateSubjects(attempts: Attempt[]): SubjectStat[] {
  const map = new Map<string, { correct: number; total: number }>();
  for (const a of attempts) {
    for (const sb of a.subjectBreakdown) {
      const cur = map.get(sb.subject) ?? { correct: 0, total: 0 };
      cur.correct += sb.correct;
      cur.total += sb.total;
      map.set(sb.subject, cur);
    }
  }
  return Array.from(map.entries())
    .map(([subject, v]) => ({
      subject,
      correct: v.correct,
      total: v.total,
      accuracy: v.total ? Math.round((v.correct / v.total) * 100) : 0,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);
}

export function Dashboard({ onBack, onUpgrade }: DashboardProps) {
  const { user, profile, refreshProfile } = useAuth();
  const reduceMotion = useReducedMotion();

  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [referralLoading, setReferralLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails>({ bankName: '', accountNumber: '', accountName: '' });
  const [requestError, setRequestError] = useState<string | null>(null);

  async function loadWithdrawals(userId: string) {
    const { data } = await supabase
      .from('withdrawal_requests')
      .select('id, amount, status, requested_at')
      .eq('user_id', userId)
      .order('requested_at', { ascending: false });
    setWithdrawals((data ?? []) as WithdrawalRow[]);
  }

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function ensureCodeAndLoad() {
      // Always pull a fresh profile (balance may have changed elsewhere, e.g. an admin marking a payout as paid).
      const freshProfile = await refreshProfile();
      if (cancelled) return;
      if (freshProfile && !freshProfile.referral_code) {
        const code = generateReferralCode(user!.email ?? 'user');
        await supabase.from('profiles').update({ referral_code: code }).eq('id', user!.id);
        await refreshProfile();
      }
      if (cancelled) return;
      await loadWithdrawals(user!.id);
      setReferralLoading(false);
    }

    ensureCodeAndLoad();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const pendingKobo = useMemo(
    () => withdrawals.filter((w) => w.status === 'pending').reduce((s, w) => s + w.amount, 0),
    [withdrawals]
  );
  const balanceKobo = profile?.referral_balance ?? 0;
  const availableKobo = Math.max(0, balanceKobo - pendingKobo);
  const hasPendingRequest = withdrawals.some((w) => w.status === 'pending');
  const belowMinimum = availableKobo < MIN_WITHDRAWAL_KOBO;

  async function requestWithdrawal() {
    if (!user || availableKobo <= 0 || hasPendingRequest || belowMinimum) return;
    if (!bankDetails.bankName.trim() || !bankDetails.accountNumber.trim() || !bankDetails.accountName.trim()) {
      setRequestError('Please fill in your bank name, account number, and account name.');
      return;
    }
    setRequestError(null);
    setRequesting(true);
    const { error } = await supabase.from('withdrawal_requests').insert({
      user_id: user.id,
      amount: availableKobo,
      status: 'pending',
      bank_name: bankDetails.bankName.trim(),
      account_number: bankDetails.accountNumber.trim(),
      account_name: bankDetails.accountName.trim(),
    });
    if (!error) {
      await loadWithdrawals(user.id);
      setShowBankForm(false);
      setBankDetails({ bankName: '', accountNumber: '', accountName: '' });
    } else {
      setRequestError(error.message);
    }
    setRequesting(false);
  }

  function copyReferralLink() {
    if (!profile?.referral_code) return;
    navigator.clipboard.writeText(buildReferralLink(profile.referral_code));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const attempts = useMemo(() => getAttempts(), []);

  const stats = useMemo(() => {
    const totalTests = attempts.length;
    const questionsAnswered = attempts.reduce((s, a) => s + a.total, 0);
    const average = totalTests
      ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / totalTests)
      : 0;
    const best = totalTests ? Math.max(...attempts.map((a) => a.percentage)) : 0;
    return { totalTests, questionsAnswered, average, best };
  }, [attempts]);

  const subjects = useMemo(() => aggregateSubjects(attempts), [attempts]);
  const recent = useMemo(() => attempts.slice(0, 8).slice().reverse(), [attempts]);

  const status = getAccessStatus(profile);
  const active = isSubscriptionActive(profile);

  let statusLabel = 'No active subscription';
  if (status === 'admin') statusLabel = 'Admin access';
  else if (status === 'paid') statusLabel = `Active until ${formatDate(profile?.paid_until ?? null)}`;
  else if (status === 'free-available') statusLabel = 'Free trial available';

  useEffect(() => { setNameInput(profile?.username ?? ''); }, [profile?.username]);

  async function saveName() {
    if (!user) return;
    setSavingName(true);
    setNameSaved(false);
    const clean = nameInput.trim().slice(0, 30);
    await supabase.from('profiles').update({ username: clean || null }).eq('id', user.id);
    await refreshProfile();
    setSavingName(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2500);
  }

  const greetingName = profile?.username || (user?.email ? user.email.split('@')[0] : 'there');

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 rounded-xl border border-school-border bg-school-surface px-4 py-2 text-sm font-semibold text-school-navy shadow-sm hover:bg-school-light dark:border-school-green/20 dark:bg-school-navy/40 dark:text-slate-200 dark:hover:bg-school-navy/60"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="section-heading font-sora text-2xl font-bold text-school-navy dark:text-white">
        Welcome back, {greetingName}
      </h1>
      <p className="mt-1 text-school-muted">Here's how your preparation is going.</p>

      {/* Account / subscription */}
      <motion.section
        variants={itemVariants}
        initial={reduceMotion ? false : 'hidden'}
        animate="show"
        className="mt-6 flex flex-col gap-4 rounded-2xl border border-school-border bg-school-surface p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-school-pale text-school-green dark:bg-school-green/20">
            <Crown size={22} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-school-muted">Account</div>
            <div className="font-sora text-lg font-semibold text-school-navy dark:text-white">
              {user?.email ?? 'Signed in'}
            </div>
            <div className="text-sm text-school-muted">{statusLabel}</div>
          </div>
        </div>
        {!active && status !== 'admin' && (
          <button
            onClick={onUpgrade}
            className="rounded-xl bg-school-green px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
          >
            {status === 'free-available' ? 'Upgrade Now' : 'Renew Access'}
          </button>
        )}
      </motion.section>

      {/* Display name — shown on leaderboards & referral shout-outs (never your email) */}
      <motion.section
        variants={itemVariants}
        initial={reduceMotion ? false : 'hidden'}
        animate="show"
        className="mt-4 rounded-2xl border border-school-border bg-school-surface p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
      >
        <div className="mb-1 flex items-center gap-2">
          <AtSign size={16} className="text-school-green" />
          <span className="text-xs font-bold uppercase tracking-widest text-school-muted">Display name</span>
        </div>
        <p className="mb-3 text-sm text-school-muted">
          Choose a public name. It's shown on leaderboards and top-referrer shout-outs — your email stays private.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            maxLength={30}
            placeholder="e.g. David O."
            className="flex-1 rounded-xl border border-school-green/20 bg-school-light px-3 py-2.5 text-sm font-medium text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
          />
          <button
            onClick={saveName}
            disabled={savingName || nameInput.trim() === (profile?.username ?? '')}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-school-green px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:opacity-40"
          >
            {savingName ? 'Saving…' : nameSaved ? <><Check size={15} /> Saved</> : 'Save name'}
          </button>
        </div>
      </motion.section>

      {/* Analytics */}
      {stats.totalTests === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-school-border bg-school-light p-10 text-center dark:border-school-green/20 dark:bg-school-navy/30">
          <TrendingUp className="mx-auto mb-4 text-school-green" size={48} />
          <p className="text-lg text-school-navy dark:text-slate-200">No analytics yet.</p>
          <p className="text-school-muted">Complete a test and your performance will show up here.</p>
        </div>
      ) : (
        <>
          <motion.section
            variants={container}
            initial={reduceMotion ? false : 'hidden'}
            animate="show"
            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <StatCard icon={<Trophy size={20} />} label="Tests completed" value={String(stats.totalTests)} />
            <StatCard icon={<BookOpen size={20} />} label="Questions answered" value={String(stats.questionsAnswered)} />
            <StatCard icon={<TrendingUp size={20} />} label="Average score" value={`${stats.average}%`} />
            <StatCard icon={<Target size={20} />} label="Best score" value={`${stats.best}%`} />
          </motion.section>

          {/* Recent trend */}
          <motion.section
            variants={itemVariants}
            initial={reduceMotion ? false : 'hidden'}
            animate="show"
            className="mt-8 rounded-2xl border border-school-border bg-school-surface p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
          >
            <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">Recent scores</h2>
            <div className="mt-5 flex h-40 items-end gap-2">
              {recent.map((a) => (
                <div key={a.id} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <div
                    className="w-full rounded-t-md bg-school-green/80"
                    style={{ height: `${Math.max(a.percentage, 4)}%` }}
                    title={`${a.testTitle}: ${a.percentage}%`}
                  />
                  <span className="text-[10px] font-medium text-school-muted">{a.percentage}%</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Per-subject performance */}
          <motion.section
            variants={itemVariants}
            initial={reduceMotion ? false : 'hidden'}
            animate="show"
            className="mt-8 rounded-2xl border border-school-border bg-school-surface p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-school-green" />
              <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">
                Subject performance
              </h2>
            </div>
            <div className="mt-5 space-y-4">
              {subjects.map((s) => (
                <div key={s.subject}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold text-school-navy dark:text-slate-100">{s.subject}</span>
                    <span className="font-medium text-school-muted">
                      {s.correct}/{s.total} ({s.accuracy}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-school-light dark:bg-school-navy/60">
                    <motion.div
                      initial={reduceMotion ? {} : { width: 0 }}
                      animate={{ width: `${s.accuracy}%` }}
                      transition={{ duration: reduceMotion ? 0 : 0.5 }}
                      className={`h-full rounded-full ${
                        s.accuracy < 40 ? 'bg-rose-500' : s.accuracy < 70 ? 'bg-amber-400' : 'bg-school-green'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </>
      )}

      {/* Referral + Balance (read-only for now) */}
      <div className="mt-8 grid min-w-0 gap-4 sm:grid-cols-2">
        <motion.section
          variants={itemVariants}
          initial={reduceMotion ? false : 'hidden'}
          animate="show"
          className="min-w-0 rounded-2xl border border-school-border bg-school-surface p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
        >
          <div className="flex items-center gap-2">
            <Gift size={18} className="text-school-green" />
            <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">Refer & earn</h2>
          </div>
          <p className="mt-2 text-sm text-school-muted">
            Share your link. When someone signs up through it and upgrades, you earn 25% of what they pay.
          </p>
          {profile?.referral_code ? (
            <button
              onClick={copyReferralLink}
              className="mt-3 flex w-full items-center justify-between gap-2 rounded-lg bg-school-light px-3 py-2 font-mono text-sm text-school-navy transition hover:bg-school-pale dark:bg-school-navy/60 dark:text-slate-200"
            >
              <span className="min-w-0 flex-1 truncate">{buildReferralLink(profile.referral_code)}</span>
              <Copy size={14} className="flex-none" />
            </button>
          ) : (
            <div className="mt-3 inline-flex rounded-lg bg-school-light px-3 py-2 font-mono text-sm text-school-muted dark:bg-school-navy/60">
              Setting up your link…
            </div>
          )}
          {copied && <p className="mt-1.5 text-xs font-semibold text-school-green">Link copied!</p>}
        </motion.section>

        <motion.section
          variants={itemVariants}
          initial={reduceMotion ? false : 'hidden'}
          animate="show"
          className="min-w-0 rounded-2xl border border-school-border bg-school-surface p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
        >
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-school-green" />
            <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">Balance</h2>
          </div>
          <div className="mt-2 font-sora text-3xl font-bold text-school-navy dark:text-white">
            ₦{(availableKobo / 100).toLocaleString()}
          </div>
          <p className="mt-1 text-sm text-school-muted">
            {referralLoading
              ? 'Loading…'
              : hasPendingRequest
              ? 'You have a payment request pending review.'
              : availableKobo <= 0
              ? 'No earnings available yet.'
              : belowMinimum
              ? `You need at least ₦${(MIN_WITHDRAWAL_KOBO / 100).toLocaleString()} to request a payout.`
              : 'Available to request now.'}
          </p>
          {showBankForm ? (
            <div className="mt-3 space-y-2">
              <input
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails((b) => ({ ...b, bankName: e.target.value }))}
                placeholder="Bank name"
                className="w-full rounded-lg border border-school-border bg-school-light px-3 py-2 text-sm text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
              />
              <input
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails((b) => ({ ...b, accountNumber: e.target.value }))}
                placeholder="Account number"
                className="w-full rounded-lg border border-school-border bg-school-light px-3 py-2 text-sm text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
              />
              <input
                value={bankDetails.accountName}
                onChange={(e) => setBankDetails((b) => ({ ...b, accountName: e.target.value }))}
                placeholder="Account name"
                className="w-full rounded-lg border border-school-border bg-school-light px-3 py-2 text-sm text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
              />
              {requestError && <p className="text-xs font-semibold text-rose-500">{requestError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBankForm(false)}
                  className="flex-1 rounded-lg border border-school-border px-4 py-2.5 text-sm font-semibold text-school-navy hover:bg-school-light dark:border-school-green/20 dark:text-slate-200 dark:hover:bg-school-navy/60"
                >
                  Cancel
                </button>
                <button
                  onClick={requestWithdrawal}
                  disabled={requesting}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-school-green px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-school-green/90 disabled:opacity-40"
                >
                  <Send size={14} /> {requesting ? 'Submitting…' : 'Submit'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowBankForm(true)}
              disabled={availableKobo <= 0 || hasPendingRequest || belowMinimum}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-school-green px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-school-green/90 disabled:opacity-40"
            >
              <Send size={14} /> Request payment
            </button>
          )}
          {withdrawals.length > 0 && (
            <div className="mt-4 border-t border-school-border pt-3 dark:border-school-green/20">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-school-muted">Payout history</p>
              <ul className="space-y-2 text-xs">
                {withdrawals.slice(0, 6).map((w) => (
                  <li key={w.id} className="flex items-center justify-between gap-2">
                    <span className="text-school-muted">{formatDate(w.requested_at)}</span>
                    <span className="font-semibold text-school-navy dark:text-slate-200">
                      ₦{(w.amount / 100).toLocaleString()}
                    </span>
                    <span
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        w.status === 'paid'
                          ? 'bg-school-pale text-school-green dark:bg-school-green/20'
                          : w.status === 'rejected'
                          ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20'
                      }`}
                    >
                      {w.status === 'paid' && <CheckCircle2 size={10} />} {w.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.section>
      </div>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      variants={itemVariants}
      initial={reduceMotion ? false : undefined}
      whileHover={reduceMotion ? {} : { y: -4 }}
      className="card rounded-2xl border border-school-border bg-school-surface p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-school-pale text-school-green dark:bg-school-green/20">
        {icon}
      </div>
      <div className="text-xs font-bold uppercase tracking-widest text-school-muted">{label}</div>
      <div className="mt-1 font-sora text-2xl font-bold text-school-navy dark:text-white">{value}</div>
    </motion.div>
  );
}
