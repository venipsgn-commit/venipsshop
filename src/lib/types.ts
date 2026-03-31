// ─── TYPES PRINCIPAUX ───────────────────────────────────────────────────────

export type Category =
  | 'telephones'
  | 'ordinateurs'
  | 'accessoires'
  | 'gaming'
  | 'tv-audio'
  | 'smart-home';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  subcategory: string;
  price: number;
  originalPrice?: number;
  description: string;
  shortDesc: string;
  features: string[];
  specs: Record<string, string>;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  badge?: 'Nouveau' | 'Promo' | 'Populaire' | 'Gaming' | 'Best Seller' | 'Exclusif';
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
  role: 'user' | 'admin';
  avatar?: string;
  addresses: Address[];
  wishlist: string[];
  createdAt: string;
}

export interface Address {
  id: string;
  label: string;
  nom: string;
  prenom: string;
  rue: string;
  ville: string;
  pays: string;
  telephone: string;
  isDefault: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export type OrderStatus =
  | 'en_attente'
  | 'confirme'
  | 'en_preparation'
  | 'expedie'
  | 'livre'
  | 'annule';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: OrderStatus;
  promoCode?: string;
  address: Address;
  paymentMethod: string;
  transiteur?: string;
  estimatedDelivery: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCode {
  code: string;
  discount: number; // percent
  minOrder: number;
  expiresAt: string;
}
