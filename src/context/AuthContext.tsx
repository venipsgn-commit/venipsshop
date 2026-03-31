'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/lib/types';
import { getCurrentUser, setCurrentUser, findUserByEmail, createUser, updateUser } from '@/lib/storage';

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
    const stored = getCurrentUser();
    if (stored) setUser(stored);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const found = findUserByEmail(email);
    if (!found) return { ok: false, error: 'Aucun compte avec cet email.' };
    if (found.password !== password) return { ok: false, error: 'Mot de passe incorrect.' };
    setUser(found);
    setCurrentUser(found);
    return { ok: true };
  };

  const register = async (data: { nom: string; prenom: string; email: string; telephone: string; password: string }) => {
    if (findUserByEmail(data.email)) return { ok: false, error: 'Cet email est déjà utilisé.' };
    const newUser = createUser(data);
    setUser(newUser);
    setCurrentUser(newUser);
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    setCurrentUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = updateUser(user.id, updates);
    setUser(updated);
    setCurrentUser(updated);
  };

  return <Ctx.Provider value={{ user, loading, login, register, logout, updateProfile }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
