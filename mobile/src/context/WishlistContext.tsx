import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { productApi } from '../api/api';
import { useAuth } from './AuthContext';

interface WishCtx {
  ids: string[];
  toggle: (id: string) => Promise<void>;
  has: (id: string) => boolean;
}

const Ctx = createContext<WishCtx | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      productApi.getWishlist()
        .then(products => setIds(products.map(p => p.id)))
        .catch(() => setIds([]));
    } else {
      AsyncStorage.getItem('wishlist')
        .then(raw => setIds(raw ? JSON.parse(raw) : []))
        .catch(() => setIds([]));
    }
  }, [user]);

  const toggle = async (id: string) => {
    const next = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
    setIds(next);
    if (user) {
      try { await productApi.toggleWishlist(id); }
      catch { setIds(ids); }
    } else {
      await AsyncStorage.setItem('wishlist', JSON.stringify(next));
    }
  };

  return (
    <Ctx.Provider value={{ ids, toggle, has: id => ids.includes(id) }}>
      {children}
    </Ctx.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
