import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, CheckCircle2, Gift, Lock, Wallet, AlertCircle, Receipt, FileText, ChevronRight, Send, Check, X, BarChart3 } from 'lucide-react';
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
}

interface AttemptRow {
  id: string;
  test_title: string | null;
  percentage: number;
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

  function loadAll() {
    return Promise.all([
      supabase
        .from('profiles')
        .select('id, email, has_paid, paid_until, free_test_used, is_admin, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('transactions')
        .select('id, user_id, paystack_reference, amount, status, created_at')
        .eq('status', 'success')
        .order('created_at', { ascending: false }),
      supabase
        .from('withdrawal_requests')
        .select('id, user_id, amount, status, requested_at')
        .order('requested_at', { ascending: false }),
      supabase.from('attempts').select('id, test_title, percentage'),
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

  async function setWithdrawalStatus(id: string, status: 'paid' | 'rejected') {
    setActingOn(id);
    const { error: updateError } = await supabase.from('withdrawal_requests').update({ status }).eq('id', id);
    if (!updateError) {
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
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-school-pale text-xs font-bold uppercase tracking-widest text-school-navy dark:bg-school-navy/60 dark:text-slate-300">
                    <tr>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Amount</th>
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
              <div className="overflow-x-auto">
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
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-school-border bg-school-surface shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
          >
            <div className="flex items-center justify-between border-b border-school-border px-5 py-4 dark:border-school-green/20">
              <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">All Users</h2>
              <span className="text-sm font-medium text-school-muted">{users.length} total</span>
            </div>

            {loading ? (
              <p className="px-5 py-8 text-center text-sm text-school-muted">Loading users…</p>
            ) : users.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-school-muted">No users yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-school-pale text-xs font-bold uppercase tracking-widest text-school-navy dark:bg-school-navy/60 dark:text-slate-300">
                    <tr>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Paid until</th>
                      <th className="px-5 py-3">Free trial used</th>
                      <th className="px-5 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-school-border dark:divide-school-green/20">
                    {users.map((u) => {
                      const status = getAccessStatus(u);
                      return (
                        <tr key={u.id} className="hover:bg-school-light dark:hover:bg-school-navy/30">
                          <td className="px-5 py-3 font-medium text-school-navy dark:text-white">
                            {u.email ?? '—'}
                          </td>
                          <td className="px-5 py-3">
                            <StatusBadge status={status} />
                          </td>
                          <td className="px-5 py-3 text-school-muted">
                            {u.paid_until ? formatDate(u.paid_until) : '—'}
                          </td>
                          <td className="px-5 py-3 text-school-muted">{u.free_test_used ? 'Yes' : 'No'}</td>
                          <td className="px-5 py-3 text-school-muted">{formatDate(u.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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
    </main>
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
