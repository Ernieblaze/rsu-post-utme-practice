import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ResetPasswordProps {
  onDone: () => void;
}

export function ResetPassword({ onDone }: ResetPasswordProps) {
  const { user, loading, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const result = await updatePassword(password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  }

  if (loading) return null;

  return (
    <main className="mx-auto max-w-sm px-4 py-20">
      <h1 className="text-center font-sora text-2xl font-bold text-school-navy dark:text-white">
        Set a new password
      </h1>

      {!user ? (
        <p className="mt-4 text-center text-school-muted">
          This password reset link is invalid or has expired. Request a new one from the log in screen.
        </p>
      ) : success ? (
        <>
          <p className="mt-4 text-center text-school-muted">Your password has been updated.</p>
          <button
            onClick={onDone}
            className="mt-6 w-full rounded-xl bg-school-green px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-school-green/90"
          >
            Continue
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-school-navy/40 dark:text-slate-400" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-lg border border-school-green/20 bg-school-light py-2.5 pl-9 pr-3 text-sm text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-school-navy/40 dark:text-slate-400" />
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-lg border border-school-green/20 bg-school-light py-2.5 pl-9 pr-3 text-sm text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-school-green py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-school-green/90 disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Save new password'}
          </button>
        </form>
      )}
    </main>
  );
}
