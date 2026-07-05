import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Gift, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPendingReferralCode, setPendingReferralCode } from '../lib/referral';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type Mode = 'signin' | 'signup' | 'forgot';

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { signUp, signIn, resetPassword, resendConfirmation } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState(() => getPendingReferralCode() ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleResend() {
    setError(null);
    setSuccess(null);
    setResending(true);
    const result = await resendConfirmation(email);
    setResending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess('Confirmation email sent! Check your inbox and your spam/junk folder.');
  }

  function reset() {
    setMode('signin');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setError(null);
    setSuccess(null);
    setSubmitting(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    if (mode === 'signup' && referralCode.trim()) {
      setPendingReferralCode(referralCode);
    }

    if (mode === 'forgot') {
      const result = await resetPassword(email);
      setSubmitting(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess('Check your email for a link to reset your password.');
      return;
    }

    const result = mode === 'signup' ? await signUp(email, password) : await signIn(email, password);

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (mode === 'signup') {
      setSuccess('Account created! Check your email to confirm, then log in.');
    } else {
      setSuccess('Logged in successfully.');
      setTimeout(handleClose, 600);
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-school-navy"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-school-navy dark:text-white">
                {mode === 'signup' ? 'Create an account' : mode === 'forgot' ? 'Reset password' : 'Log in'}
              </h2>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="rounded-full p-1 text-school-navy/60 hover:bg-school-pale dark:text-slate-300 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-school-navy/40 dark:text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full rounded-lg border border-school-green/20 bg-school-light py-2.5 pl-9 pr-3 text-sm text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-white/10 dark:text-white"
                />
              </div>

              {mode !== 'forgot' && (
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-school-navy/40 dark:text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full rounded-lg border border-school-green/20 bg-school-light py-2.5 pl-9 pr-10 text-sm text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-white/10 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-school-navy/50 hover:bg-school-pale hover:text-school-navy dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              )}

              {mode === 'signin' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs font-semibold text-school-green hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {mode === 'signup' && (
                <div className="relative">
                  <Gift size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-school-navy/40 dark:text-slate-400" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Referral code (optional)"
                    className="w-full rounded-lg border border-school-green/20 bg-school-light py-2.5 pl-9 pr-3 text-sm text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-white/10 dark:text-white"
                  />
                </div>
              )}

              {error && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                  {error}
                </p>
              )}
              {success && (
                <p className="rounded-lg bg-school-green/10 px-3 py-2 text-sm font-medium text-school-green dark:text-green-400">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-school-green py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-school-green/90 disabled:opacity-60"
              >
                {submitting
                  ? 'Please wait…'
                  : mode === 'signup'
                  ? 'Sign up'
                  : mode === 'forgot'
                  ? 'Send reset link'
                  : 'Log in'}
              </button>
            </form>

            {mode !== 'forgot' && (
              <div className="mt-3 rounded-lg bg-school-light px-3 py-2 text-center dark:bg-school-navy/60">
                <p className="text-xs text-school-navy/70 dark:text-slate-400">
                  Didn't get the confirmation email?
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="mt-0.5 text-xs font-bold text-school-green hover:underline disabled:opacity-60"
                >
                  {resending ? 'Sending…' : 'Resend confirmation email'}
                </button>
              </div>
            )}

            <p className="mt-4 text-center text-sm text-school-navy/70 dark:text-slate-300">
              {mode === 'forgot' ? (
                <>
                  Remembered it?{' '}
                  <button onClick={() => switchMode('signin')} className="font-semibold text-school-green hover:underline">
                    Log in
                  </button>
                </>
              ) : mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button onClick={() => switchMode('signin')} className="font-semibold text-school-green hover:underline">
                    Log in
                  </button>
                </>
              ) : (
                <>
                  Need an account?{' '}
                  <button onClick={() => switchMode('signup')} className="font-semibold text-school-green hover:underline">
                    Sign up
                  </button>
                </>
              )}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
