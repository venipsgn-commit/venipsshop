const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://venipsshop-production.up.railway.app/api/v1';

// ── Token management ──────────────────────────────────────────────
export const getAccessToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('venips_access_token') : null;

export const getRefreshToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('venips_refresh_token') : null;

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('venips_access_token', access);
  localStorage.setItem('venips_refresh_token', refresh);
};

export const clearTokens = () => {
  localStorage.removeItem('venips_access_token');
  localStorage.removeItem('venips_refresh_token');
};

// ── Core fetch wrapper ────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, options, false);
    clearTokens();
    window.location.href = '/auth/connexion';
    throw new Error('Session expirée');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur réseau' }));
    throw new Error(err.error || err.message || 'Erreur inconnue');
  }

  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

// ── Auth ──────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; password: string; prenom: string; nom: string; telephone?: string }) =>
    request<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST', body: JSON.stringify(data),
    }),

  login: (email: string, password: string) =>
    request<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),

  logout: (refreshToken: string) =>
    request<void>('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }),

  me: () => request<User>('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<void>('/auth/change-password', {
      method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST', body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST', body: JSON.stringify({ token, newPassword }),
    }),
};

// ── Products ──────────────────────────────────────────────────────
export const productApi = {
  list: (params: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<{ products: Product[]; pagination: Pagination }>(`/products${qs ? '?' + qs : ''}`);
  },

  get: (slug: string) => request<Product>(`/products/${slug}`),

  create: (data: Partial<Product>) =>
    request<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Product>) =>
    request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request<void>(`/products/${id}`, { method: 'DELETE' }),

  addReview: (productId: string, rating: number, comment?: string) =>
    request<Review>(`/products/${productId}/reviews`, {
      method: 'POST', body: JSON.stringify({ rating, comment }),
    }),

  toggleWishlist: (productId: string) =>
    request<{ wishlisted: boolean }>(`/products/${productId}/wishlist`, { method: 'POST' }),

  getWishlist: () => request<Product[]>('/products/me/wishlist'),
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

  all: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ orders: Order[]; pagination: Pagination }>(`/orders${qs ? '?' + qs : ''}`);
  },

  updateStatus: (id: string, status?: string, paymentStatus?: string) =>
    request<Order>(`/orders/${id}/status`, {
      method: 'PUT', body: JSON.stringify({ status, paymentStatus }),
    }),
};

// ── Users ─────────────────────────────────────────────────────────
export const userApi = {
  updateProfile: (data: { prenom?: string; nom?: string; telephone?: string }) =>
    request<User>('/users/me', { method: 'PUT', body: JSON.stringify(data) }),

  getAddresses: () => request<Address[]>('/users/me/addresses'),

  addAddress: (data: Omit<Address, 'id' | 'userId' | 'createdAt'>) =>
    request<Address>('/users/me/addresses', { method: 'POST', body: JSON.stringify(data) }),

  updateAddress: (id: string, data: Partial<Address>) =>
    request<Address>(`/users/me/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteAddress: (id: string) =>
    request<void>(`/users/me/addresses/${id}`, { method: 'DELETE' }),

  list: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ users: User[]; pagination: Pagination }>(`/users${qs ? '?' + qs : ''}`);
  },
};

// ── Categories ────────────────────────────────────────────────────
export const categoryApi = {
  list: () => request<Category[]>('/categories'),
  create: (data: { name: string; description?: string; icon?: string }) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Category>) =>
    request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/categories/${id}`, { method: 'DELETE' }),
};

// ── Promo ─────────────────────────────────────────────────────────
export const promoApi = {
  validate: (code: string, orderAmount?: number) =>
    request<{ valid: boolean; discount: number; discountAmount: number | null; minOrder: number }>(
      '/promo/validate', { method: 'POST', body: JSON.stringify({ code, orderAmount }) }
    ),
  list: () => request<PromoCode[]>('/promo'),
  create: (data: Partial<PromoCode>) =>
    request<PromoCode>('/promo', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<PromoCode>) =>
    request<PromoCode>(`/promo/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/promo/${id}`, { method: 'DELETE' }),
};

// ── Types ─────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  telephone?: string;
  role: 'USER' | 'ADMIN';
  isActive?: boolean;
  createdAt?: string;
  addresses?: Address[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categoryId: string;
  category?: { name: string; slug: string };
  brand: string;
  badge?: string;
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

export interface Address {
  id: string;
  userId: string;
  label: string;
  prenom: string;
  nom: string;
  telephone: string;
  rue: string;
  commune?: string;
  ville: string;
  pays: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: { prenom: string; nom: string; email: string };
  addressId?: string;
  address?: Address;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  promoCode?: string;
  notes?: string;
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
  addressId?: string;
  paymentMethod: string;
  promoCode?: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  _count?: { products: number };
}

export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  minOrder: number;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface Pagination {
  page: number;
  limit?: number;
  total: number;
  pages: number;
}

export type OrderStatus = 'EN_ATTENTE' | 'CONFIRME' | 'EN_PREPARATION' | 'EXPEDIE' | 'LIVRE' | 'ANNULE';
