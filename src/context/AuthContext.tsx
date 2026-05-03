import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { appScriptApi } from '../lib/appScriptApi';
import { sessionStorageAdapter } from '../lib/session';
import { AppUser, AuthSession } from '../types';

type AuthContextValue = {
  session: AuthSession | null;
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthSession>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setSession: (session: AuthSession | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  const syncSession = (nextSession: AuthSession | null) => {
    setSession(nextSession);
    if (nextSession) {
      sessionStorageAdapter.set(nextSession);
    } else {
      sessionStorageAdapter.clear();
    }
  };

  const refresh = async () => {
    const storedSession = sessionStorageAdapter.get();
    if (!storedSession) {
      syncSession(null);
      setLoading(false);
      return;
    }

    try {
      const validated = await appScriptApi.me(storedSession.token);
      syncSession(validated);
    } catch {
      syncSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email: string, password: string) => {
    const nextSession = await appScriptApi.login(email, password);
    syncSession(nextSession);
    return nextSession;
  };

  const logout = async () => {
    const current = sessionStorageAdapter.get();
    if (current?.token) {
      try {
        await appScriptApi.logout(current.token);
      } catch {
        // Ignore logout network issues and clear local session.
      }
    }

    syncSession(null);
  };

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    loading,
    login,
    logout,
    refresh,
    setSession: syncSession,
  }), [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
