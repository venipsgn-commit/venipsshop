'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { formatPrice, formatPriceShort } from '@/lib/storage';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

const BADGE_STYLE: Record<string, string> = {
  'Nouveau':    'bg-emerald-500 text-white',
  'Promo':      'bg-teal-500 text-white',
  'Populaire':  'bg-blue-600 text-white',
  'Gaming':     'bg-violet-600 text-white',
  'Best Seller':'bg-yellow-500 text-white',
  'Exclusif':   'bg-gray-900 text-white',
};

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const wished = has(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col overflow-hidden">
      {/* Image */}
      <Link href={`/produit/${product.id}`} className="relative block overflow-hidden bg-gray-50">
        <div className="relative h-44 sm:h-56">
          <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
        </div>
        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${BADGE_STYLE[product.badge]}`}>
            {product.badge}
          </span>
        )}
        {discount && (
          <span className="absolute top-3 right-10 text-xs font-bold px-2.5 py-1 rounded-full bg-red-500 text-white">
            -{discount}%
          </span>
        )}
        {/* Wishlist */}
        <button
          onClick={e => { e.preventDefault(); toggle(product.id); }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${wished ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}
        >
          <svg className="w-4 h-4" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        {/* Stock faible */}
        {product.stock > 0 && product.stock <= 5 && (
          <div className="absolute bottom-0 left-0 right-0 bg-teal-500/90 text-white text-[10px] font-semibold text-center py-1">
            ⚡ Plus que {product.stock} en stock !
          </div>
        )}
      </Link>

      {/* Infos */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <p className="text-[10px] sm:text-xs text-teal-500 font-semibold uppercase tracking-wider mb-1">{product.brand}</p>
        <Link href={`/produit/${product.id}`}>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 hover:text-teal-500 transition-colors line-clamp-2 leading-snug mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Étoiles */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[1,2,3,4,5].map(s => (
              <svg key={s} className={`w-3 h-3 ${s <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
          </div>
          <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
        </div>

        {/* Prix */}
        <div className="mt-auto">
          <div className="mb-2">
            <span className="block sm:hidden text-sm font-bold text-gray-900">{formatPriceShort(product.price)}</span>
            <span className="hidden sm:block text-base font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">{formatPriceShort(product.originalPrice)}</span>
            )}
          </div>

          <button
            onClick={() => addItem(product)}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white text-xs sm:text-sm font-semibold py-2 sm:py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
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
