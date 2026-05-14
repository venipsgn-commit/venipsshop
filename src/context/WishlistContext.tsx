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

  useEffect(() => {
    if (user) {
      // Récupérer les IDs locaux éventuellement ajoutés sans être connecté
      let localIds: string[] = [];
      try {
        const stored = JSON.parse(localStorage.getItem('vshop_wishlist') ?? '[]');
        if (Array.isArray(stored)) localIds = stored;
      } catch {}

      const load = async () => {
        const products = await productApi.getWishlist();
        const serverIds = products.map(p => p.id);

        // Synchroniser les items localStorage vers le backend
        if (localIds.length > 0) {
          const toSync = localIds.filter(id => !serverIds.includes(id));
          if (toSync.length > 0) {
            await Promise.all(toSync.map(id => productApi.toggleWishlist(id).catch(() => {})));
            localStorage.removeItem('vshop_wishlist');
            const updated = await productApi.getWishlist();
            setIds(updated.map(p => p.id));
            return;
          }
          localStorage.removeItem('vshop_wishlist');
        }

        setIds(serverIds);
      };

      load().catch(() => setIds([]));
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
