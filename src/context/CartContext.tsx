'use client';
import { createContext, useContext, useEffect, useReducer } from 'react';
import type { CartItem, Product } from '@/lib/types';
import { pixel } from '@/lib/pixel';

interface State { items: CartItem[]; isOpen: boolean; }
type Action =
  | { type: 'ADD'; product: Product }
  | { type: 'REMOVE'; id: string }
  | { type: 'SET_QTY'; id: string; qty: number }
  | { type: 'CLEAR' }
  | { type: 'TOGGLE' }
  | { type: 'CLOSE' };

const reduce = (s: State, a: Action): State => {
  switch (a.type) {
    case 'ADD': {
      const ex = s.items.find(i => i.product.id === a.product.id);
      return { ...s, isOpen: true, items: ex
        ? s.items.map(i => i.product.id === a.product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...s.items, { product: a.product, quantity: 1 }] };
    }
    case 'REMOVE': return { ...s, items: s.items.filter(i => i.product.id !== a.id) };
    case 'SET_QTY':
      if (a.qty <= 0) return { ...s, items: s.items.filter(i => i.product.id !== a.id) };
      return { ...s, items: s.items.map(i => i.product.id === a.id ? { ...i, quantity: a.qty } : i) };
    case 'CLEAR': return { ...s, items: [] };
    case 'TOGGLE': return { ...s, isOpen: !s.isOpen };
    case 'CLOSE': return { ...s, isOpen: false };
    default: return s;
  }
};

interface CartCtx {
  items: CartItem[]; isOpen: boolean;
  addItem: (p: Product) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clearCart: () => void;
  toggle: () => void;
  close: () => void;
  totalItems: number;
  totalPrice: number;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reduce, { items: [], isOpen: false });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('vshop_cart') ?? '[]') as CartItem[];
      saved.forEach(item => {
        for (let i = 0; i < item.quantity; i++) dispatch({ type: 'ADD', product: item.product });
      });
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('vshop_cart', JSON.stringify(state.items));
  }, [state.items]);

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = state.items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <Ctx.Provider value={{
      items: state.items, isOpen: state.isOpen,
      addItem: p => {
        dispatch({ type: 'ADD', product: p });
        pixel.addToCart({ id: p.id, name: p.name, price: p.price });
      },
      removeItem: id => dispatch({ type: 'REMOVE', id }),
      setQty: (id, qty) => dispatch({ type: 'SET_QTY', id, qty }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
      toggle: () => dispatch({ type: 'TOGGLE' }),
      close: () => dispatch({ type: 'CLOSE' }),
      totalItems, totalPrice,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
