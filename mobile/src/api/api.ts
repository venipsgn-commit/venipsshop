import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://venipsshop-production.up.railway.app/api/v1';

let _accessToken: string | null = null;

export const getAccessToken = () => _accessToken;
export const setAccessToken = (t: string | null) => { _accessToken = t; };

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (_accessToken) headers['Authorization'] = `Bearer ${_accessToken}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, options, false);
    _accessToken = null;
    await AsyncStorage.removeItem('refresh_token');
    throw new Error('SESSION_EXPIRED');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur réseau' }));
    throw new Error(err.error || err.message || 'Erreur inconnue');
  }

  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  try {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    if (!refreshToken) return false;
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    _accessToken = data.accessToken;
    if (data.refreshToken) await AsyncStorage.setItem('refresh_token', data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

// ── Auth ──────────────────────────────────────────────────────────
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur de connexion');
    return data as { user: User; accessToken: string; refreshToken?: string };
  },

  register: async (body: { email: string; password: string; prenom: string; nom: string; telephone?: string }) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erreur d'inscription");
    return data as { user: User; accessToken: string; refreshToken?: string };
  },

  me: () => request<User>('/auth/me'),
};

// ── Products ──────────────────────────────────────────────────────
export const productApi = {
  list: (params: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<{ products: Product[]; pagination: Pagination }>(`/products${qs ? '?' + qs : ''}`);
  },

  get: (slug: string) => request<Product>(`/products/${slug}`),

  toggleWishlist: (productId: string) =>
    request<{ wishlisted: boolean }>(`/products/${productId}/wishlist`, { method: 'POST' }),

  getWishlist: () => request<Product[]>('/products/me/wishlist'),

  addReview: (productId: string, rating: number, comment?: string) =>
    request<Review>(`/products/${productId}/reviews`, {
      method: 'POST', body: JSON.stringify({ rating, comment }),
    }),
};

// ── Orders ────────────────────────────────────────────────────────
export const orderApi = {
  create: (data: CreateOrderPayload) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),

  myOrders: (page = 1) =>
    request<{ orders: Order[]; pagination: Pagination }>(`/orders/me?page=${page}`),

  get: (id: string) => request<Order>(`/orders/${id}`),

  cancel: (id: string) =>
    request<void>(`/orders/${id}/cancel`, { method: 'POST' }),
};

// ── Categories ────────────────────────────────────────────────────
export const categoryApi = {
  list: () => request<Category[]>('/categories'),
};

// ── Promo ─────────────────────────────────────────────────────────
export const promoApi = {
  validate: (code: string, orderAmount?: number) =>
    request<{ valid: boolean; discount: number; discountAmount: number | null }>('/promo/validate', {
      method: 'POST', body: JSON.stringify({ code, orderAmount }),
    }),
};

// ── Types ─────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  telephone?: string;
  role: 'USER' | 'ADMIN';
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc?: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
  categoryId: string;
  category?: { name: string; slug: string };
  brand: string;
  badge?: string | null;
  images: string[];
  features: string[];
  specs: Record<string, unknown>;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  reviews?: Review[];
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: { prenom: string; nom: string };
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CreateOrderPayload {
  items: { productId: string; quantity: number }[];
  paymentMethod: string;
  promoCode?: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  isActive: boolean;
}

export interface Pagination {
  page: number;
  total: number;
  pages: number;
}

export type OrderStatus = 'EN_ATTENTE' | 'CONFIRME' | 'EN_PREPARATION' | 'EXPEDIE' | 'LIVRE' | 'ANNULE';
