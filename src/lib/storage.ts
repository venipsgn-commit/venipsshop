import { User, Order, Product } from './types';

// ─── HELPERS ────────────────────────────────────────────────────────────────

const get = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; }
  catch { return fallback; }
};
const set = (key: string, val: unknown) => {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(val));
};

// ─── USERS ──────────────────────────────────────────────────────────────────

export const getUsers = (): User[] => get<User[]>('vshop_users', []);
export const saveUsers = (users: User[]) => set('vshop_users', users);

export const findUserByEmail = (email: string): User | undefined =>
  getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());

export const createUser = (data: Omit<User, 'id' | 'role' | 'addresses' | 'wishlist' | 'createdAt'>): User => {
  const users = getUsers();
  const user: User = {
    ...data,
    id: `usr_${Date.now()}`,
    role: users.length === 0 ? 'admin' : 'user', // premier compte = admin
    addresses: [],
    wishlist: [],
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, user]);
  return user;
};

export const updateUser = (userId: string, updates: Partial<User>) => {
  const users = getUsers().map(u => u.id === userId ? { ...u, ...updates } : u);
  saveUsers(users);
  return users.find(u => u.id === userId)!;
};

// ─── SESSION ─────────────────────────────────────────────────────────────────

export const getCurrentUser = (): User | null => get<User | null>('vshop_session', null);
export const setCurrentUser = (user: User | null) => set('vshop_session', user);
export const logout = () => { if (typeof window !== 'undefined') localStorage.removeItem('vshop_session'); };

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export const getAllOrders = (): Order[] => get<Order[]>('vshop_orders', []);
export const saveAllOrders = (orders: Order[]) => set('vshop_orders', orders);

export const getUserOrders = (userId: string): Order[] =>
  getAllOrders().filter(o => o.userId === userId);

export const createOrder = (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order => {
  const newOrder: Order = {
    ...order,
    id: `ORD-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveAllOrders([...getAllOrders(), newOrder]);
  return newOrder;
};

export const updateOrderStatus = (orderId: string, status: Order['status']) => {
  const orders = getAllOrders().map(o =>
    o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
  );
  saveAllOrders(orders);
};

// ─── PRODUCTS (admin override) ────────────────────────────────────────────────

export const getAdminProducts = (): Product[] | null => get<Product[] | null>('vshop_products', null);
export const saveAdminProducts = (products: Product[]) => set('vshop_products', products);

// ─── UTILS ───────────────────────────────────────────────────────────────────

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-GN', { maximumFractionDigits: 0 }).format(price) + ' GNF';

export const formatPriceShort = formatPrice;

export const getStatusLabel = (status: Order['status']) => ({
  en_attente:     { label: 'En attente',     color: 'yellow' },
  confirme:       { label: 'Confirmé',        color: 'blue'   },
  en_preparation: { label: 'En préparation', color: 'indigo' },
  expedie:        { label: 'Expédié',        color: 'orange' },
  livre:          { label: 'Livré',          color: 'green'  },
  annule:         { label: 'Annulé',         color: 'red'    },
}[status]);
