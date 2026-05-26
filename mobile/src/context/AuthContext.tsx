import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, setAccessToken, User } from '../api/api';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; prenom: string; nom: string; telephone?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          setAccessToken(token);
          const me = await authApi.me();
          setUser(me);
        }
      } catch {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setAccessToken(data.accessToken);
    await AsyncStorage.setItem('access_token', data.accessToken);
    if (data.refreshToken) await AsyncStorage.setItem('refresh_token', data.refreshToken);
    setUser(data.user);
  };

  const register = async (body: { email: string; password: string; prenom: string; nom: string; telephone?: string }) => {
    const data = await authApi.register(body);
    setAccessToken(data.accessToken);
    await AsyncStorage.setItem('access_token', data.accessToken);
    if (data.refreshToken) await AsyncStorage.setItem('refresh_token', data.refreshToken);
    setUser(data.user);
  };

  const logout = async () => {
    setAccessToken(null);
    setUser(null);
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
  };

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
