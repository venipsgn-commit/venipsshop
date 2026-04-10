'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { productApi } from '@/lib/api';
import { useAuth } from './AuthContext';

interface WishCtx {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
}

const Ctx = createContext<WishCtx | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);

  // Load wishlist from API when logged in, localStorage otherwise
  useEffect(() => {
    if (user) {
      productApi.getWishlist()
        .then(products => setIds(products.map(p => p.id)))
        .catch(() => setIds([]));
    } else {
      try { setIds(JSON.parse(localStorage.getItem('vshop_wishlist') ?? '[]')); }
      catch { setIds([]); }
    }
  }, [user]);

  const toggle = async (id: string) => {
    // Optimistic UI update
    const next = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
    setIds(next);

    if (user) {
      try {
        await productApi.toggleWishlist(id);
      } catch {
        // Rollback on error
        setIds(ids);
      }
    } else {
      localStorage.setItem('vshop_wishlist', JSON.stringify(next));
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
