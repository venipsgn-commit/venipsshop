'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { authApi, setAccessToken, clearAccessToken, tryRefresh, type User } from '@/lib/api';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: { nom: string; prenom: string; email: string; telephone: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tente de restaurer la session depuis le cookie httpOnly (venips_rt)
    // Le cookie est invisible au JS — c'est le proxy /api/auth/refresh qui le lit
    tryRefresh()
      .then(ok => {
        if (!ok) return null;
        return authApi.me();
      })
      .then(u => { if (u) setUser(u); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
      setAccessToken(data.accessToken);
      setUser(data.user);
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : 'Erreur de connexion' };
    }
  };

  const register = async (data: { nom: string; prenom: string; email: string; telephone: string; password: string }) => {
    try {
      const res = await authApi.register(data);
      setAccessToken(res.accessToken);
      setUser(res.user);
      return { ok: true };
    } catch (e: unknown) {
      return { ok: false, error: e instanceof Error ? e.message : 'Erreur lors de l\'inscription' };
    }
  };

  const logout = async () => {
    await authApi.logout(); // efface le cookie httpOnly via le proxy + clearAccessToken()
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      const updated = await authApi.me();
      setUser({ ...updated, ...updates });
    } catch {}
  };

  return <Ctx.Provider value={{ user, loading, login, register, logout, updateProfile }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
