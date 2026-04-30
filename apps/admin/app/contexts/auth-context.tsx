'use client';

import { apiFetch } from '@/lib/api';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string; name?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const refreshUser = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const jwt = window.localStorage.getItem('admin_jwt');
    if (!jwt) {
      setUser(null);
      return;
    }
    const res = await apiFetch<AuthUser>('/api/auth/me');
    if (res.code === 0 && res.data) {
      setUser(res.data);
      window.localStorage.setItem('admin_user', JSON.stringify(res.data));
    } else {
      window.localStorage.removeItem('admin_jwt');
      window.localStorage.removeItem('admin_user');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem('admin_user');
    if (raw) {
      try {
        setUser(JSON.parse(raw) as AuthUser);
      } catch {
        window.localStorage.removeItem('admin_user');
      }
    }
    void refreshUser().finally(() => setReady(true));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{ accessToken: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email, password }),
    });
    if (res.code !== 0 || !res.data?.accessToken) {
      throw new Error(res.message || '登录失败');
    }
    window.localStorage.setItem('admin_jwt', res.data.accessToken);
    window.localStorage.setItem('admin_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  }, []);

  const register = useCallback(async (input: { email: string; password: string; name?: string }) => {
    const res = await apiFetch<AuthUser>('/api/auth/register', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify(input),
    });
    if (res.code !== 0 || !res.data) {
      throw new Error(res.message || '注册失败');
    }
    await login(input.email, input.password);
  }, [login]);

  const logout = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem('admin_jwt');
    window.localStorage.removeItem('admin_user');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, register, logout, refreshUser }),
    [user, ready, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
