import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  /** true once a real session OR a dev bypass is active */
  authed: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  /** dev-only: enter the app when Supabase isn't configured yet */
  devEnter: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [bypass, setBypass] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    if (!supabase) return { error: 'Supabase is not configured.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  };

  const signOut = async () => {
    setBypass(false);
    if (supabase) await supabase.auth.signOut();
    setSession(null);
  };

  const value: AuthContextValue = {
    user: session?.user ?? null,
    session,
    loading,
    configured: isSupabaseConfigured,
    authed: Boolean(session) || bypass,
    signIn,
    signOut,
    devEnter: () => setBypass(true),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
