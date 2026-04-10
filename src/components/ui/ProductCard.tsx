'use client';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

// Compatible avec les deux types de produits (hardcodé + API)
interface AnyProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number | null;
  images: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  badge?: string | null;
  slug?: string;
}

const BADGE_STYLE: Record<string, string> = {
  'Nouveau':    'bg-emerald-500 text-white',
  'NOUVEAU':    'bg-emerald-500 text-white',
  'Promo':      'bg-red-500 text-white',
  'PROMO':      'bg-red-500 text-white',
  'Populaire':  'bg-blue-600 text-white',
  'POPULAIRE':  'bg-blue-600 text-white',
  'Gaming':     'bg-violet-600 text-white',
  'GAMING':     'bg-violet-600 text-white',
  'Best Seller':'bg-amber-500 text-white',
  'BEST_SELLER':'bg-amber-500 text-white',
  'Exclusif':   'bg-gray-900 text-white',
  'EXCLUSIF':   'bg-gray-900 text-white',
};

export default function ProductCard({ product }: { product: AnyProduct }) {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const wished = has(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  // Lien vers la page produit — utilise slug si dispo, sinon id
  const href = `/produit/${product.slug || product.id}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden">

      {/* Image */}
      <Link href={href} className="relative block overflow-hidden bg-gray-50">
        <div className="relative h-44 sm:h-52">
          <Image
            src={product.images[0]} alt={product.name} fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {product.badge && (
          <span className={`absolute top-3 left-3 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${BADGE_STYLE[product.badge] ?? 'bg-gray-700 text-white'}`}>
            {product.badge.replace('_', ' ')}
          </span>
        )}

        {discount && discount > 0 && (
          <span className="absolute top-3 right-10 flex items-center gap-0.5 bg-red-500 text-white text-[10px] sm:text-xs font-extrabold px-2 py-1 rounded-full shadow-md">
            -{discount}%
          </span>
        )}

        <button
          onClick={e => { e.preventDefault(); toggle(product.id); }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md border ${
            wished ? 'bg-red-500 text-white border-red-500' : 'bg-white/90 text-gray-400 hover:text-red-500 border-white/50'
          }`}
        >
          <svg className="w-4 h-4" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute bottom-0 left-0 right-0 bg-teal-500/90 text-white text-[10px] font-semibold text-center py-1">
            ⚡ Plus que {product.stock} en stock !
          </div>
        )}
      </Link>

      {/* Infos */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <p className="text-[10px] sm:text-xs text-teal-500 font-bold uppercase tracking-wider mb-1">{product.brand}</p>

        <Link href={href}>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 hover:text-teal-600 transition-colors line-clamp-2 leading-snug mb-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {[1,2,3,4,5].map(s => (
              <svg key={s} className={`w-3 h-3 ${s <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
          </div>
          <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-end gap-2 mb-3">
            <span className="text-base sm:text-lg font-extrabold text-gray-900">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through leading-6">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          {product.originalPrice && (
            <p className="text-[10px] text-emerald-600 font-semibold mb-2">
              Vous économisez {formatPrice(product.originalPrice - product.price)}
            </p>
          )}

          <button
            onClick={() => addItem(product as any)}
            className="w-full text-white text-xs sm:text-sm font-bold py-2 sm:py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
            style={{background: 'linear-gradient(135deg, #22c55e, #15803d)', boxShadow: '0 4px 12px rgba(34,197,94,0.25)'}}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="hidden sm:inline">Ajouter au panier</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </div>
      </div>
    </div>
  );
}
