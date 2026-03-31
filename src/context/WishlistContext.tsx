'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface WishCtx {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
}

const Ctx = createContext<WishCtx | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, updateProfile } = useAuth();
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    if (user) setIds(user.wishlist ?? []);
    else {
      try { setIds(JSON.parse(localStorage.getItem('vshop_wishlist') ?? '[]')); }
      catch { setIds([]); }
    }
  }, [user]);

  const toggle = (id: string) => {
    const next = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
    setIds(next);
    if (user) updateProfile({ wishlist: next });
    else localStorage.setItem('vshop_wishlist', JSON.stringify(next));
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
