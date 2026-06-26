import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, CheckCircle2, Gift, Lock, Wallet, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { getAccessStatus } from '../lib/access';
import { formatDate } from '../lib/helpers';

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

const PRICE_NAIRA = Number(import.meta.env.VITE_APP_PRICE ?? '200000') / 100;

export function OwnerDashboard({ onBack }: OwnerDashboardProps) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from('profiles')
      .select('id, email, has_paid, paid_until, free_test_used, is_admin, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error: queryError }) => {
        if (cancelled) return;
        if (queryError) {
          setError(queryError.message);
        } else {
          setUsers((data ?? []) as UserRow[]);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
      <p className="mt-1 text-school-muted">All users, payment status, and a revenue estimate.</p>

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
              <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">
                Revenue (estimate)
              </h2>
            </div>
            <div className="mt-2 font-sora text-3xl font-bold text-school-navy dark:text-white">
              ₦{(stats.paid * PRICE_NAIRA).toLocaleString()}
            </div>
            <p className="mt-1 text-sm text-school-muted">
              {stats.paid} active paid user(s) × ₦{PRICE_NAIRA.toLocaleString()}. This is an estimate based on
              who currently has an active subscription — not a real transaction history yet. Real
              payment-by-payment tracking is coming next.
            </p>
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
