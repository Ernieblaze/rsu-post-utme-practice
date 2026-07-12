import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Gift, Eye, EyeOff, MessageCircle, ExternalLink, AtSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPendingReferralCode, setPendingReferralCode } from '../lib/referral';
import { setPendingUsername } from '../lib/pendingUsername';
import { isInAppBrowser } from '../lib/browser';
import { WHATSAPP_NUMBER } from '../lib/support';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

type Mode = 'signin' | 'signup' | 'forgot';

/** The official multi-colour Google "G" mark. */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { signUp, signIn, signInWithGoogle, resetPassword, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState(() => getPendingReferralCode() ?? '');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const inApp = isInAppBrowser();
  const helpLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I need help logging in / resetting my password on RSU Post-UTME Practice.')}`;

  async function handleGoogle() {
    setError(null);
    setSuccess(null);
    // Carry any typed referral code into the pending store so it survives the
    // redirect to Google and attributes when the user returns.
    if (referralCode.trim()) setPendingReferralCode(referralCode);
    setSubmitting(true);
    const result = await signInWithGoogle();
    if (result.error) {
      setSubmitting(false);
      setError(result.error);
    }
    // On success the page redirects to Google — no further handling needed.
  }

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
    if (mode === 'signup' && username.trim()) {
      setPendingUsername(username);
    }

    if (mode === 'forgot') {
      const result = await resetPassword(email);
      setSubmitting(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess('Reset link sent! Check your inbox AND your spam/junk folder. If the link still won\'t open, you\'re likely in an in-app browser — open the site in Chrome, or chat with us on WhatsApp below.');
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

            {inApp && (
              <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                <span className="flex items-start gap-1.5">
                  <ExternalLink size={13} className="mt-0.5 flex-none" />
                  You're in an in-app browser (WhatsApp/TikTok). Login often fails here — tap the ⋮ / share menu and choose "Open in Chrome / Browser", then try again.
                </span>
              </div>
            )}

            {mode !== 'forgot' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-school-green/20 bg-white py-2.5 text-sm font-bold text-school-navy shadow-sm transition hover:bg-school-light disabled:opacity-60 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  <GoogleIcon />
                  {mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
                </button>
                <div className="my-3 flex items-center gap-3">
                  <span className="h-px flex-1 bg-school-green/15 dark:bg-white/10" />
                  <span className="text-xs font-medium text-school-navy/50 dark:text-slate-400">or use email</span>
                  <span className="h-px flex-1 bg-school-green/15 dark:bg-white/10" />
                </div>
              </>
            )}

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
                  <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-school-navy/40 dark:text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={30}
                    placeholder="Display name (e.g. David O.)"
                    className="w-full rounded-lg border border-school-green/20 bg-school-light py-2.5 pl-9 pr-3 text-sm text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-white/10 dark:text-white"
                  />
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

            <div className="mt-3 space-y-1.5 border-t border-school-green/10 pt-3 text-center dark:border-white/10">
              <button
                type="button"
                onClick={() => { handleClose(); navigate('/login-help'); }}
                className="block w-full text-xs font-bold text-school-green hover:underline"
              >
                Struggling to log in or reset your password? Read the quick guide →
              </button>
              <a href={helpLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-school-navy/70 hover:underline dark:text-slate-300">
                <MessageCircle size={13} /> or chat with us on WhatsApp
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
