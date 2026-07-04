import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, CheckCircle2, Gift, Lock, Wallet, AlertCircle, Receipt, FileText, ChevronRight, Send, Check, X, BarChart3, Crown, Search, Undo2, Download, AlertTriangle, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { getAccessStatus } from '../lib/access';
import { formatDate, formatDateTime } from '../lib/helpers';

interface OwnerDashboardProps {
  onBack: () => void;
}

interface UserRow {
  id: string;
  email: string | null;
  has_paid: boolean;
  paid_until: string | null;
  free_test_used: boolean;
  is_admin: boolean;
  created_at: string;
  referral_code: string | null;
  referred_by: string | null;
  referral_balance: number;
}

interface TransactionRow {
  id: string;
  user_id: string | null;
  paystack_reference: string | null;
  amount: number;
  status: string;
  created_at: string;
}

interface WithdrawalRow {
  id: string;
  user_id: string | null;
  amount: number;
  status: string;
  requested_at: string;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
}

interface AttemptRow {
  id: string;
  user_id: string | null;
  test_title: string | null;
  score: number | null;
  total: number | null;
  percentage: number;
  created_at: string;
}

export function OwnerDashboard({ onBack }: OwnerDashboardProps) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [attemptRows, setAttemptRows] = useState<AttemptRow[]>([]);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  function loadAll() {
    return Promise.all([
      supabase
        .from('profiles')
        .select('id, email, has_paid, paid_until, free_test_used, is_admin, created_at, referral_code, referred_by, referral_balance')
        .order('created_at', { ascending: false }),
      supabase
        .from('transactions')
        .select('id, user_id, paystack_reference, amount, status, created_at')
        .eq('status', 'success')
        .order('created_at', { ascending: false }),
      supabase
        .from('withdrawal_requests')
        .select('id, user_id, amount, status, requested_at, bank_name, account_number, account_name')
        .order('requested_at', { ascending: false }),
      supabase.from('attempts').select('id, user_id, test_title, score, total, percentage, created_at'),
    ]);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    loadAll().then(([usersRes, txRes, wdRes, attemptsRes]) => {
      if (cancelled) return;
      if (usersRes.error) {
        setError(usersRes.error.message);
      } else if (txRes.error) {
        setError(txRes.error.message);
      } else if (wdRes.error) {
        setError(wdRes.error.message);
      } else {
        setUsers((usersRes.data ?? []) as UserRow[]);
        setTransactions((txRes.data ?? []) as TransactionRow[]);
        setWithdrawals((wdRes.data ?? []) as WithdrawalRow[]);
      }
      if (attemptsRes.error) {
        setUsageError(attemptsRes.error.message);
      } else {
        setAttemptRows((attemptsRes.data ?? []) as AttemptRow[]);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const usageStats = useMemo(() => {
    const total = attemptRows.length;
    const avgScore = total
      ? Math.round(attemptRows.reduce((s, a) => s + a.percentage, 0) / total)
      : 0;
    const counts = new Map<string, number>();
    attemptRows.forEach((a) => {
      const title = a.test_title ?? 'Unknown';
      counts.set(title, (counts.get(title) ?? 0) + 1);
    });
    let mostPopular = '—';
    let mostPopularCount = 0;
    counts.forEach((count, title) => {
      if (count > mostPopularCount) {
        mostPopularCount = count;
        mostPopular = title;
      }
    });
    return { total, avgScore, mostPopular };
  }, [attemptRows]);

  // Manually grant one year of Premium — the safety net when a payment went
  // through on Paystack but the webhook didn't update the profile.
  async function grantPremium(userId: string) {
    setActingOn(userId);
    // Uses a SECURITY DEFINER function so an admin can update another user's
    // row (direct table updates are blocked by row-level security).
    const { error: err } = await supabase.rpc('admin_set_premium', {
      target_id: userId,
      make_premium: true,
    });
    if (err) {
      window.alert('Could not grant premium: ' + err.message);
    } else {
      const paidUntil = new Date();
      paidUntil.setFullYear(paidUntil.getFullYear() + 1);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, has_paid: true, paid_until: paidUntil.toISOString() } : u))
      );
    }
    setActingOn(null);
  }

  async function revokePremium(userId: string) {
    if (!window.confirm('Remove Premium access from this user?')) return;
    setActingOn(userId);
    const { error: err } = await supabase.rpc('admin_set_premium', {
      target_id: userId,
      make_premium: false,
    });
    if (err) {
      window.alert('Could not revoke premium: ' + err.message);
    } else {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, has_paid: false, paid_until: null } : u)));
    }
    setActingOn(null);
  }

  async function setWithdrawalStatus(id: string, status: 'paid' | 'rejected') {
    setActingOn(id);
    const request = withdrawals.find((w) => w.id === id);
    const { error: updateError } = await supabase
      .from('withdrawal_requests')
      .update({ status, resolved_at: new Date().toISOString() })
      .eq('id', id);

    if (!updateError) {
      if (status === 'paid' && request?.user_id) {
        const { data: payee } = await supabase
          .from('profiles')
          .select('referral_balance')
          .eq('id', request.user_id)
          .single();
        const newBalance = Math.max(0, (payee?.referral_balance ?? 0) - request.amount);
        await supabase.from('profiles').update({ referral_balance: newBalance }).eq('id', request.user_id);
      }
      setWithdrawals((prev) => prev.map((w) => (w.id === id ? { ...w, status } : w)));
    }
    setActingOn(null);
  }

  const emailById = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u) => {
      if (u.email) map.set(u.id, u.email);
    });
    return map;
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => (u.email ?? '').toLowerCase().includes(q));
  }, [users, userSearch]);

  // Everyone who has successfully referred someone (earned a balance) or been
  // referred, so you can see your referral activity at a glance.
  const referrers = useMemo(
    () =>
      users
        .filter((u) => (u.referral_balance ?? 0) > 0)
        .sort((a, b) => (b.referral_balance ?? 0) - (a.referral_balance ?? 0)),
    [users]
  );
  const totalReferralOwed = useMemo(
    () => users.reduce((sum, u) => sum + (u.referral_balance ?? 0), 0),
    [users]
  );

  // Derive the open user from `users` so the modal stays fresh after grant/revoke.
  const selectedUser = useMemo(
    () => (selectedUserId ? users.find((u) => u.id === selectedUserId) ?? null : null),
    [selectedUserId, users]
  );
  const selectedUserAttempts = useMemo(
    () =>
      selectedUserId
        ? attemptRows
            .filter((a) => a.user_id === selectedUserId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        : [],
    [selectedUserId, attemptRows]
  );

  // ── "Paid but not Premium" detector ──
  // Only genuine SUCCESSFUL Paystack transactions are considered (the query
  // already filters status = 'success'), so a mere payment attempt never
  // counts. Flags anyone with a real payment who isn't currently Premium.
  const paidButNotPremium = useMemo(() => {
    const premiumIds = new Set(
      users.filter((u) => ['paid', 'admin'].includes(getAccessStatus(u))).map((u) => u.id)
    );
    const flagged = new Map<string, { email: string; amount: number; ref: string; date: string }>();
    transactions.forEach((t) => {
      if (t.user_id && !premiumIds.has(t.user_id) && !flagged.has(t.user_id)) {
        flagged.set(t.user_id, {
          email: emailById.get(t.user_id) ?? t.user_id,
          amount: t.amount,
          ref: t.paystack_reference ?? '',
          date: t.created_at,
        });
      }
    });
    return [...flagged.entries()].map(([id, info]) => ({ id, ...info }));
  }, [users, transactions, emailById]);

  // ── Growth: signups + revenue for today / this week / this month ──
  const growth = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const countSince = (rows: { created_at: string }[], since: number) =>
      rows.filter((r) => new Date(r.created_at).getTime() >= since).length;
    const revenueSince = (since: number) =>
      transactions
        .filter((t) => new Date(t.created_at).getTime() >= since)
        .reduce((s, t) => s + t.amount, 0) / 100;

    return {
      signupsToday: countSince(users, startOfToday),
      signupsWeek: countSince(users, weekAgo),
      signupsMonth: countSince(users, startOfMonth),
      revenueToday: revenueSince(startOfToday),
      revenueWeek: revenueSince(weekAgo),
      revenueMonth: revenueSince(startOfMonth),
    };
  }, [users, transactions]);

  // ── Email lists for CSV export ──
  const paidEmails = useMemo(
    () => users.filter((u) => getAccessStatus(u) === 'paid' && u.email).map((u) => u.email as string),
    [users]
  );
  const unpaidEmails = useMemo(
    () =>
      users
        .filter((u) => ['free-available', 'locked'].includes(getAccessStatus(u)) && u.email)
        .map((u) => u.email as string),
    [users]
  );

  function downloadCsv(filename: string, emails: string[]) {
    if (emails.length === 0) {
      window.alert('No emails to export in this group yet.');
      return;
    }
    const csv = 'email\n' + emails.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalRevenueNaira = useMemo(
    () => transactions.reduce((sum, t) => sum + t.amount, 0) / 100,
    [transactions]
  );

  const stats = useMemo(() => {
    let paid = 0;
    let freeAvailable = 0;
    let locked = 0;
    let admins = 0;
    users.forEach((u) => {
      const status = getAccessStatus(u);
      if (status === 'admin') admins += 1;
      else if (status === 'paid') paid += 1;
      else if (status === 'free-available') freeAvailable += 1;
      else locked += 1;
    });
    return { total: users.length, paid, freeAvailable, locked, admins };
  }, [users]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 rounded-xl border border-school-border bg-school-surface px-4 py-2 text-sm font-semibold text-school-navy shadow-sm hover:bg-school-light dark:border-school-green/20 dark:bg-school-navy/40 dark:text-slate-200 dark:hover:bg-school-navy/60"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="section-heading font-sora text-2xl font-bold text-school-navy dark:text-white">
        Owner Dashboard
      </h1>
      <p className="mt-1 text-school-muted">All users, payment status, and real revenue from Paystack.</p>

      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        onClick={() => navigate('/admin')}
        className="mt-6 flex w-full items-center gap-4 rounded-2xl border border-school-border bg-school-surface p-5 text-left shadow-sm transition hover:bg-school-light dark:border-school-green/20 dark:bg-school-navy/40 dark:hover:bg-school-navy/60"
      >
        <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-school-pale text-school-green dark:bg-school-green/20">
          <FileText size={22} />
        </div>
        <div className="flex-1">
          <div className="font-sora text-lg font-semibold text-school-navy dark:text-white">Question Manager</div>
          <div className="text-sm text-school-muted">Upload, edit, and publish exam questions (PIN required).</div>
        </div>
        <ChevronRight size={20} className="text-school-muted" />
      </motion.button>

      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
          <AlertCircle size={16} /> Could not load users: {error}
        </div>
      )}

      {!error && (
        <>
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <StatCard icon={<Users size={20} />} label="Total users" value={String(stats.total)} />
            <StatCard icon={<CheckCircle2 size={20} />} label="Active paid" value={String(stats.paid)} />
            <StatCard icon={<Gift size={20} />} label="Free trial available" value={String(stats.freeAvailable)} />
            <StatCard icon={<Lock size={20} />} label="Locked (trial used)" value={String(stats.locked)} />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-school-border bg-school-surface p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
          >
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-school-green" />
              <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">Revenue</h2>
            </div>
            <div className="mt-2 font-sora text-3xl font-bold text-school-navy dark:text-white">
              ₦{totalRevenueNaira.toLocaleString()}
            </div>
            <p className="mt-1 text-sm text-school-muted">
              From {transactions.length} successful payment(s), based on real Paystack transaction records.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-school-border bg-school-surface shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
          >
            <div className="flex items-center justify-between border-b border-school-border px-5 py-4 dark:border-school-green/20">
              <div className="flex items-center gap-2">
                <Send size={18} className="text-school-green" />
                <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">
                  Referral Payout Requests
                </h2>
              </div>
              <span className="text-sm font-medium text-school-muted">
                {withdrawals.filter((w) => w.status === 'pending').length} pending
              </span>
            </div>

            {withdrawals.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-school-muted">No payout requests yet.</p>
            ) : (
              <>
                <div className="divide-y divide-school-border sm:hidden dark:divide-school-green/20">
                  {withdrawals.map((w) => (
                    <div key={w.id} className="space-y-2 px-5 py-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="min-w-0 flex-1 truncate font-medium text-school-navy dark:text-white">
                          {(w.user_id && emailById.get(w.user_id)) ?? '—'}
                        </span>
                        <span
                          className={`flex-none rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            w.status === 'paid'
                              ? 'bg-school-pale text-school-green dark:bg-school-green/20'
                              : w.status === 'rejected'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20'
                          }`}
                        >
                          {w.status}
                        </span>
                      </div>
                      <div className="font-sora text-xl font-bold text-school-navy dark:text-white">
                        ₦{(w.amount / 100).toLocaleString()}
                      </div>
                      <div className="text-sm text-school-muted">
                        {w.bank_name ? (
                          <>
                            {w.bank_name}
                            <br />
                            {w.account_number} — {w.account_name}
                          </>
                        ) : (
                          'No bank details'
                        )}
                      </div>
                      <div className="text-xs text-school-muted">{formatDateTime(w.requested_at)}</div>
                      {w.status === 'pending' && (
                        <div className="flex gap-1.5 pt-1">
                          <button
                            onClick={() => setWithdrawalStatus(w.id, 'paid')}
                            disabled={actingOn === w.id}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-school-green px-2.5 py-2 text-xs font-bold text-white hover:bg-school-green/90 disabled:opacity-40"
                          >
                            <Check size={12} /> Mark paid
                          </button>
                          <button
                            onClick={() => setWithdrawalStatus(w.id, 'rejected')}
                            disabled={actingOn === w.id}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-school-border px-2.5 py-2 text-xs font-bold text-school-navy hover:bg-school-light disabled:opacity-40 dark:border-school-green/20 dark:text-slate-200 dark:hover:bg-school-navy/60"
                          >
                            <X size={12} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-school-pale text-xs font-bold uppercase tracking-widest text-school-navy dark:bg-school-navy/60 dark:text-slate-300">
                      <tr>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">User</th>
                        <th className="px-5 py-3">Amount</th>
                        <th className="px-5 py-3">Bank Details</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-school-border dark:divide-school-green/20">
                      {withdrawals.map((w) => (
                        <tr key={w.id} className="hover:bg-school-light dark:hover:bg-school-navy/30">
                          <td className="px-5 py-3 text-school-muted">{formatDateTime(w.requested_at)}</td>
                          <td className="px-5 py-3 font-medium text-school-navy dark:text-white">
                            {(w.user_id && emailById.get(w.user_id)) ?? '—'}
                          </td>
                          <td className="px-5 py-3 font-semibold text-school-navy dark:text-slate-200">
                            ₦{(w.amount / 100).toLocaleString()}
                          </td>
                          <td className="px-5 py-3 text-school-muted">
                            {w.bank_name ? (
                              <>
                                {w.bank_name}
                                <br />
                                {w.account_number} — {w.account_name}
                              </>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                w.status === 'paid'
                                  ? 'bg-school-pale text-school-green dark:bg-school-green/20'
                                  : w.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20'
                              }`}
                            >
                              {w.status}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            {w.status === 'pending' && (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => setWithdrawalStatus(w.id, 'paid')}
                                  disabled={actingOn === w.id}
                                  className="flex items-center gap-1 rounded-lg bg-school-green px-2.5 py-1.5 text-xs font-bold text-white hover:bg-school-green/90 disabled:opacity-40"
                                >
                                  <Check size={12} /> Mark paid
                                </button>
                                <button
                                  onClick={() => setWithdrawalStatus(w.id, 'rejected')}
                                  disabled={actingOn === w.id}
                                  className="flex items-center gap-1 rounded-lg border border-school-border px-2.5 py-1.5 text-xs font-bold text-school-navy hover:bg-school-light disabled:opacity-40 dark:border-school-green/20 dark:text-slate-200 dark:hover:bg-school-navy/60"
                                >
                                  <X size={12} /> Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-school-border bg-school-surface shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
          >
            <div className="flex items-center justify-between border-b border-school-border px-5 py-4 dark:border-school-green/20">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-school-green" />
                <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">
                  Recent Payments
                </h2>
              </div>
              <span className="text-sm font-medium text-school-muted">{transactions.length} total</span>
            </div>

            {transactions.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-school-muted">No payments recorded yet.</p>
            ) : (
              <>
                <div className="divide-y divide-school-border sm:hidden dark:divide-school-green/20">
                  {transactions.slice(0, 20).map((t) => (
                    <div key={t.id} className="space-y-1 px-5 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="min-w-0 flex-1 truncate font-medium text-school-navy dark:text-white">
                          {(t.user_id && emailById.get(t.user_id)) ?? '—'}
                        </span>
                        <span className="flex-none font-semibold text-school-navy dark:text-slate-200">
                          ₦{(t.amount / 100).toLocaleString()}
                        </span>
                      </div>
                      <div className="truncate text-xs text-school-muted">{t.paystack_reference ?? '—'}</div>
                      <div className="text-xs text-school-muted">{formatDateTime(t.created_at)}</div>
                    </div>
                  ))}
                </div>

                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-school-pale text-xs font-bold uppercase tracking-widest text-school-navy dark:bg-school-navy/60 dark:text-slate-300">
                      <tr>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">User</th>
                        <th className="px-5 py-3">Reference</th>
                        <th className="px-5 py-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-school-border dark:divide-school-green/20">
                      {transactions.slice(0, 20).map((t) => (
                        <tr key={t.id} className="hover:bg-school-light dark:hover:bg-school-navy/30">
                          <td className="px-5 py-3 text-school-muted">{formatDateTime(t.created_at)}</td>
                          <td className="px-5 py-3 font-medium text-school-navy dark:text-white">
                            {(t.user_id && emailById.get(t.user_id)) ?? '—'}
                          </td>
                          <td className="px-5 py-3 text-school-muted">{t.paystack_reference ?? '—'}</td>
                          <td className="px-5 py-3 font-semibold text-school-navy dark:text-slate-200">
                            ₦{(t.amount / 100).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </motion.section>

          {/* ── Growth: signups + revenue over time ── */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-school-border bg-school-surface p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
          >
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-school-green" />
              <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">Growth</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <GrowthCard label="Signups today" value={String(growth.signupsToday)} />
              <GrowthCard label="Signups this week" value={String(growth.signupsWeek)} />
              <GrowthCard label="Signups this month" value={String(growth.signupsMonth)} />
              <GrowthCard label="Revenue today" value={`₦${growth.revenueToday.toLocaleString()}`} money />
              <GrowthCard label="Revenue this week" value={`₦${growth.revenueWeek.toLocaleString()}`} money />
              <GrowthCard label="Revenue this month" value={`₦${growth.revenueMonth.toLocaleString()}`} money />
            </div>
          </motion.section>

          {/* ── Paid but NOT Premium detector ── */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 rounded-2xl border shadow-sm ${
              paidButNotPremium.length > 0
                ? 'border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10'
                : 'border-school-border bg-school-surface dark:border-school-green/20 dark:bg-school-navy/40'
            }`}
          >
            <div className="flex items-center gap-2 border-b border-school-border/60 px-5 py-4 dark:border-white/10">
              <AlertTriangle size={18} className={paidButNotPremium.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-school-muted'} />
              <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">
                Paid but not Premium
              </h2>
              <span className="ml-auto text-sm font-medium text-school-muted">{paidButNotPremium.length} to review</span>
            </div>
            {paidButNotPremium.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-school-muted">
                ✓ Everyone who paid has Premium. No action needed.
              </p>
            ) : (
              <div className="divide-y divide-amber-200/60 dark:divide-white/10">
                <p className="px-5 pt-3 text-xs text-amber-800 dark:text-amber-300">
                  These accounts have a <strong>successful Paystack payment</strong> but aren't Premium — likely a webhook miss. Verify and grant.
                </p>
                {paidButNotPremium.map((p) => (
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                    <div className="min-w-0">
                      <button
                        onClick={() => setSelectedUserId(p.id)}
                        className="truncate font-medium text-school-green hover:underline"
                      >
                        {p.email}
                      </button>
                      <p className="text-xs text-school-muted">
                        ₦{(p.amount / 100).toLocaleString()} · {p.ref || 'no ref'} · {formatDate(p.date)}
                      </p>
                    </div>
                    <button
                      onClick={() => grantPremium(p.id)}
                      disabled={actingOn === p.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-school-green px-3 py-1.5 text-xs font-bold text-white hover:bg-school-green/90 disabled:opacity-50"
                    >
                      <Crown size={13} /> {actingOn === p.id ? '…' : 'Grant Premium'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-school-border bg-school-surface shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
          >
            <div className="flex flex-col gap-3 border-b border-school-border px-5 py-4 dark:border-school-green/20 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">All Users</h2>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => downloadCsv('paid-emails.csv', paidEmails)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-school-green/10 px-3 py-2 text-xs font-bold text-school-green hover:bg-school-green/20"
                >
                  <Download size={13} /> Paid emails ({paidEmails.length})
                </button>
                <button
                  onClick={() => downloadCsv('unpaid-emails.csv', unpaidEmails)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
                >
                  <Download size={13} /> Unpaid emails ({unpaidEmails.length})
                </button>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-school-muted" />
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by email…"
                    className="w-full rounded-xl border border-school-border bg-school-light py-2 pl-9 pr-3 text-sm text-school-navy focus:border-school-green focus:outline-none dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white sm:w-48"
                  />
                </div>
                <span className="flex-none text-sm font-medium text-school-muted">{filteredUsers.length} shown</span>
              </div>
            </div>

            {loading ? (
              <p className="px-5 py-8 text-center text-sm text-school-muted">Loading users…</p>
            ) : filteredUsers.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-school-muted">No users match your search.</p>
            ) : (
              <>
                <div className="divide-y divide-school-border sm:hidden dark:divide-school-green/20">
                  {filteredUsers.map((u) => {
                    const status = getAccessStatus(u);
                    const isPremiumNow = status === 'admin' || status === 'paid';
                    return (
                      <div key={u.id} className="space-y-1.5 px-5 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelectedUserId(u.id)}
                            className="min-w-0 flex-1 truncate text-left font-medium text-school-green hover:underline"
                          >
                            {u.email ?? '—'}
                          </button>
                          <span className="flex-none">
                            <StatusBadge status={status} />
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-school-muted">
                          <span>Paid until: {u.paid_until ? formatDate(u.paid_until) : '—'}</span>
                          <span>Joined: {formatDate(u.created_at)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-school-muted">
                          <span>Referral earned: ₦{((u.referral_balance ?? 0) / 100).toLocaleString()}</span>
                          {u.referred_by && <span>Referred by: {emailById.get(u.referred_by) ?? '—'}</span>}
                        </div>
                        {status !== 'admin' && (
                          <button
                            onClick={() => (isPremiumNow ? revokePremium(u.id) : grantPremium(u.id))}
                            disabled={actingOn === u.id}
                            className={`mt-1 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-50 ${
                              isPremiumNow
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                                : 'bg-school-green text-white'
                            }`}
                          >
                            {isPremiumNow ? <><Undo2 size={13} /> Revoke Premium</> : <><Crown size={13} /> Grant Premium</>}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-school-pale text-xs font-bold uppercase tracking-widest text-school-navy dark:bg-school-navy/60 dark:text-slate-300">
                      <tr>
                        <th className="px-5 py-3">Email</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Paid until</th>
                        <th className="px-5 py-3">Referral</th>
                        <th className="px-5 py-3">Joined</th>
                        <th className="px-5 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-school-border dark:divide-school-green/20">
                      {filteredUsers.map((u) => {
                        const status = getAccessStatus(u);
                        const isPremiumNow = status === 'admin' || status === 'paid';
                        return (
                          <tr key={u.id} className="hover:bg-school-light dark:hover:bg-school-navy/30">
                            <td className="px-5 py-3 font-medium text-school-navy dark:text-white">
                              <button
                                onClick={() => setSelectedUserId(u.id)}
                                className="text-left text-school-green hover:underline"
                              >
                                {u.email ?? '—'}
                              </button>
                            </td>
                            <td className="px-5 py-3">
                              <StatusBadge status={status} />
                            </td>
                            <td className="px-5 py-3 text-school-muted">
                              {u.paid_until ? formatDate(u.paid_until) : '—'}
                            </td>
                            <td className="px-5 py-3 text-school-muted">
                              {(u.referral_balance ?? 0) > 0 && (
                                <span className="font-semibold text-school-green">
                                  ₦{((u.referral_balance ?? 0) / 100).toLocaleString()}
                                </span>
                              )}
                              {u.referred_by && (
                                <span className="block text-[11px]">via {emailById.get(u.referred_by) ?? '—'}</span>
                              )}
                              {!(u.referral_balance ?? 0) && !u.referred_by && '—'}
                            </td>
                            <td className="px-5 py-3 text-school-muted">{formatDate(u.created_at)}</td>
                            <td className="px-5 py-3">
                              {status === 'admin' ? (
                                <span className="text-xs text-school-muted">—</span>
                              ) : (
                                <button
                                  onClick={() => (isPremiumNow ? revokePremium(u.id) : grantPremium(u.id))}
                                  disabled={actingOn === u.id}
                                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-50 ${
                                    isPremiumNow
                                      ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300'
                                      : 'bg-school-green text-white hover:bg-school-green/90'
                                  }`}
                                >
                                  {actingOn === u.id
                                    ? '…'
                                    : isPremiumNow
                                    ? <><Undo2 size={13} /> Revoke</>
                                    : <><Crown size={13} /> Grant Premium</>}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-school-border bg-school-surface shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
          >
            <div className="flex items-center justify-between border-b border-school-border px-5 py-4 dark:border-school-green/20">
              <div className="flex items-center gap-2">
                <Gift size={18} className="text-school-green" />
                <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">Referral Activity</h2>
              </div>
              <span className="text-sm font-medium text-school-muted">
                ₦{(totalReferralOwed / 100).toLocaleString()} earned across all referrers
              </span>
            </div>
            {referrers.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-school-muted">
                No referral earnings yet. When someone signs up through a user's link and pays, that user shows up here.
              </p>
            ) : (
              <div className="divide-y divide-school-border dark:divide-school-green/20">
                {referrers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span className="min-w-0 flex-1 truncate font-medium text-school-navy dark:text-white">
                      {u.email ?? '—'}
                    </span>
                    <span className="flex-none font-bold text-school-green">
                      ₦{((u.referral_balance ?? 0) / 100).toLocaleString()} earned
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-school-border bg-school-surface p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
          >
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-school-green" />
              <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">
                Site-wide Usage
              </h2>
            </div>
            {usageError ? (
              <p className="mt-2 text-sm text-school-muted">
                Usage tracking isn't connected yet ({usageError}).
              </p>
            ) : (
              <>
                <p className="mt-1 text-sm text-school-muted">
                  Only counts tests completed since server-side logging was added — older activity isn't included.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <StatCard icon={<BarChart3 size={20} />} label="Attempts logged" value={String(usageStats.total)} />
                  <StatCard icon={<CheckCircle2 size={20} />} label="Average score" value={`${usageStats.avgScore}%`} />
                  <StatCard icon={<FileText size={20} />} label="Most popular paper" value={usageStats.mostPopular} />
                </div>
              </>
            )}
          </motion.section>
        </>
      )}

      {/* ── Per-user activity modal ── */}
      {selectedUser && (() => {
        const u = selectedUser;
        const status = getAccessStatus(u);
        const isPremiumNow = status === 'admin' || status === 'paid';
        return (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4"
            onClick={() => setSelectedUserId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-school-navy"
            >
              <div className="flex items-start justify-between gap-3 border-b border-school-border px-5 py-4 dark:border-school-green/20">
                <div className="min-w-0">
                  <h3 className="truncate font-sora text-lg font-bold text-school-navy dark:text-white">
                    {u.email ?? '—'}
                  </h3>
                  <div className="mt-1"><StatusBadge status={status} /></div>
                </div>
                <button
                  onClick={() => setSelectedUserId(null)}
                  className="flex-none rounded-full p-1.5 text-school-muted hover:bg-school-pale dark:hover:bg-white/10"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 px-5 py-4">
                {/* Account facts */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Fact label="Joined" value={formatDate(u.created_at)} />
                  <Fact label="Paid until" value={u.paid_until ? formatDate(u.paid_until) : '—'} />
                  <Fact label="Free trial used" value={u.free_test_used ? 'Yes' : 'No'} />
                  <Fact label="Referral earned" value={`₦${((u.referral_balance ?? 0) / 100).toLocaleString()}`} />
                  {u.referred_by && (
                    <Fact label="Referred by" value={emailById.get(u.referred_by) ?? '—'} />
                  )}
                  {u.referral_code && <Fact label="Referral code" value={u.referral_code} />}
                </div>

                {/* Grant / revoke */}
                {status !== 'admin' && (
                  <button
                    onClick={() => (isPremiumNow ? revokePremium(u.id) : grantPremium(u.id))}
                    disabled={actingOn === u.id}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-50 ${
                      isPremiumNow
                        ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300'
                        : 'bg-school-green text-white hover:bg-school-green/90'
                    }`}
                  >
                    {actingOn === u.id
                      ? 'Working…'
                      : isPremiumNow
                      ? <><Undo2 size={15} /> Revoke Premium access</>
                      : <><Crown size={15} /> Grant Premium (1 year)</>}
                  </button>
                )}

                {/* Their activity */}
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-school-muted">
                    Test activity ({selectedUserAttempts.length})
                  </p>
                  {selectedUserAttempts.length === 0 ? (
                    <p className="rounded-xl bg-school-light px-4 py-6 text-center text-sm text-school-muted dark:bg-school-navy/60">
                      This user hasn't completed any tests yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedUserAttempts.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between gap-3 rounded-xl bg-school-light px-4 py-2.5 text-sm dark:bg-school-navy/60"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium text-school-navy dark:text-white">
                              {a.test_title ?? 'Test'}
                            </p>
                            <p className="text-xs text-school-muted">{formatDateTime(a.created_at)}</p>
                          </div>
                          <span className="flex-none font-bold text-school-green">
                            {a.score != null && a.total != null ? `${a.score}/${a.total}` : ''}{' '}
                            <span className="text-school-muted">({a.percentage}%)</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        );
      })()}
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-school-light px-3 py-2 dark:bg-school-navy/60">
      <div className="text-[10px] font-bold uppercase tracking-wide text-school-muted">{label}</div>
      <div className="truncate font-semibold text-school-navy dark:text-white">{value}</div>
    </div>
  );
}

function GrowthCard({ label, value, money }: { label: string; value: string; money?: boolean }) {
  return (
    <div className="rounded-xl border border-school-border bg-school-light p-3 dark:border-school-green/20 dark:bg-school-navy/60">
      <div className="text-[10px] font-bold uppercase tracking-wide text-school-muted">{label}</div>
      <div className={`font-sora text-xl font-bold ${money ? 'text-school-green' : 'text-school-navy dark:text-white'}`}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'admin' | 'paid' | 'free-available' | 'locked' }) {
  const styles: Record<typeof status, string> = {
    admin: 'bg-school-navy text-white dark:bg-white/10',
    paid: 'bg-school-pale text-school-green dark:bg-school-green/20',
    'free-available': 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    locked: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  };
  const labels: Record<typeof status, string> = {
    admin: 'Admin',
    paid: 'Paid',
    'free-available': 'Free trial available',
    locked: 'Locked',
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-school-border bg-school-surface p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-school-pale text-school-green dark:bg-school-green/20">
        {icon}
      </div>
      <div className="text-xs font-bold uppercase tracking-widest text-school-muted">{label}</div>
      <div className="mt-1 font-sora text-2xl font-bold text-school-navy dark:text-white">{value}</div>
    </motion.div>
  );
}
