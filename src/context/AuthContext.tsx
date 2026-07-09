import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../lib/access';
import { consumeJustSignedUpFlag, getPendingReferralCode, markJustSignedUp } from '../lib/referral';
import { consumePendingUsername } from '../lib/pendingUsername';
import { clearPremiumLocally } from '../lib/access';
import { logEmailEvent } from '../lib/emailEvents';
import { trackTikTok } from '../lib/tiktok';

interface AuthResult {
  error: string | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
  profileLoading: boolean;
  refreshProfile: () => Promise<Profile | null>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  resendConfirmation: (email: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/**
 * Turn raw Supabase auth errors into student-friendly messages. The most
 * common one is "Failed to fetch" — a network error that happens a lot when
 * users open the site inside an in-app browser (Gmail/Facebook link) instead
 * of Chrome. Give them a clear next step instead of a scary technical string.
 */
function friendlyAuthError(message?: string): string {
  if (!message) return 'Something went wrong. Please try again.';
  const m = message.toLowerCase();
  if (m.includes('failed to fetch') || m.includes('network') || m.includes('load failed')) {
    return "Couldn't connect. Please check your internet, or open the site directly in Chrome (not from an email or WhatsApp link), then try again.";
  }
  if (m.includes('invalid login credentials')) {
    return 'Wrong email or password. Please check and try again — or tap "Forgot password?".';
  }
  if (m.includes('email not confirmed')) {
    return 'Please confirm your email first — check your inbox (and spam) for the confirmation link.';
  }
  return message;
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, has_paid, paid_until, free_test_used, is_admin, referral_code, referred_by, referral_balance, username')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as Profile;
}

/**
 * If this login follows a fresh signup that happened via a referral link,
 * attribute the new account to its referrer (one-time, own-row update only).
 * Looks up the referrer through a SECURITY DEFINER function so a regular
 * user never needs read access to anyone else's profile row.
 */
async function attributeReferralIfPending(profile: Profile): Promise<boolean> {
  if (profile.referred_by) return false;
  const pendingCode = getPendingReferralCode();
  const wasJustSignedUp = consumeJustSignedUpFlag();
  if (!pendingCode || !wasJustSignedUp) return false;

  const { data: referrerId } = await supabase.rpc('find_referrer_id', { code: pendingCode });

  if (referrerId && referrerId !== profile.id) {
    const { error } = await supabase.from('profiles').update({ referred_by: referrerId }).eq('id', profile.id);
    return !error;
  }
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    fetchProfile(userId).then(async (p) => {
      if (cancelled) return;
      if (p) {
        const attributed = await attributeReferralIfPending(p);
        if (attributed) {
          p = await fetchProfile(userId);
        }
        // Save a display name chosen at sign-up (couldn't write until authenticated).
        if (p && !p.username) {
          const pendingName = consumePendingUsername();
          if (pendingName) {
            const { error } = await supabase.from('profiles').update({ username: pendingName }).eq('id', userId);
            if (!error) p = await fetchProfile(userId);
          }
        }
      }
      if (!cancelled) {
        setProfile(p);
        setProfileLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function refreshProfile(): Promise<Profile | null> {
    if (!userId) {
      setProfile(null);
      return null;
    }
    const p = await fetchProfile(userId);
    setProfile(p);
    return p;
  }

  async function signUp(email: string, password: string): Promise<AuthResult> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/email-confirmed` },
    });
    if (!error) {
      markJustSignedUp();
      logEmailEvent('signup'); // confirmation email sent — counts toward the daily cap
      trackTikTok('CompleteRegistration'); // TikTok conversion: a new student signed up
      return { error: null };
    }
    const status = (error as { status?: number }).status;
    // 500 = SMTP failure (Supabase couldn't send the confirmation email)
    if (status === 500 || !error.message || error.message === '{}') {
      return { error: 'We could not send your confirmation email right now. Please try again in a few minutes.' };
    }
    // Surface the real message for everything else (wrong password, rate limit, etc.)
    return { error: friendlyAuthError(error.message) };
  }

  async function signIn(email: string, password: string): Promise<AuthResult> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? friendlyAuthError(error.message) : null };
  }

  async function signOut(): Promise<AuthResult> {
    clearPremiumLocally(); // remove localStorage flag so it doesn't persist to next user
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
  }

  async function resetPassword(email: string): Promise<AuthResult> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (!error) logEmailEvent('reset'); // reset email sent — counts toward the daily cap
    return { error: error ? friendlyAuthError(error.message) : null };
  }

  async function updatePassword(newPassword: string): Promise<AuthResult> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error ? friendlyAuthError(error.message) : null };
  }

  async function resendConfirmation(email: string): Promise<AuthResult> {
    const clean = email.trim();
    if (!clean) return { error: 'Please enter your email address first.' };
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: clean,
      options: { emailRedirectTo: `${window.location.origin}/email-confirmed` },
    });
    if (!error) {
      logEmailEvent('resend'); // resent confirmation — counts toward the daily cap
      return { error: null };
    }
    const status = (error as { status?: number }).status;
    if (status === 500 || !error.message || error.message === '{}') {
      return { error: 'We could not send the email right now. Please try again in a few minutes.' };
    }
    return { error: friendlyAuthError(error.message) };
  }

  const value: AuthContextValue = {
    user: session?.user ?? null,
    session,
    loading,
    profile,
    profileLoading,
    refreshProfile,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    resendConfirmation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
