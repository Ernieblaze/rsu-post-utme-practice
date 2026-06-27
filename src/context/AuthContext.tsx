import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../lib/access';
import { consumeJustSignedUpFlag, getPendingReferralCode, markJustSignedUp } from '../lib/referral';

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
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, has_paid, paid_until, free_test_used, is_admin, referral_code, referred_by, referral_balance')
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
    const { error } = await supabase.auth.signUp({ email, password });
    if (!error) markJustSignedUp();
    return { error: error ? error.message : null };
  }

  async function signIn(email: string, password: string): Promise<AuthResult> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  }

  async function signOut(): Promise<AuthResult> {
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
