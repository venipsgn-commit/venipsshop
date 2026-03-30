'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product, formatPrice } from '@/lib/products';
import { useCart } from '@/context/CartContext';

const badgeColors: Record<string, string> = {
  'Nouveau':    'bg-green-100 text-green-700',
  'Promo':      'bg-red-100 text-red-700',
  'Populaire':  'bg-orange-100 text-orange-700',
  'Gaming':     'bg-purple-100 text-purple-700',
  'Best Seller':'bg-blue-100 text-blue-700',
  'Top Rated':  'bg-yellow-100 text-yellow-700',
};

/** Prix court pour mobile : 1 899 000 → "1,9M F" / 650 000 → "650K F" */
function formatPriceMobile(price: number): string {
  if (price >= 1_000_000) {
    const m = (price / 1_000_000).toFixed(1).replace('.0', '');
    return `${m}M FCFA`;
  }
  if (price >= 1_000) {
    const k = Math.round(price / 1_000);
    return `${k}K FCFA`;
  }
  return `${price} FCFA`;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden border border-gray-100 flex flex-col">

      {/* ─── IMAGE ─── */}
      <Link href={`/produits/${product.id}`} className="block">
        <div className="relative h-36 sm:h-52 bg-gray-50 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />

          {/* Badge + remise */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.badge && (
              <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${badgeColors[product.badge] ?? 'bg-gray-100 text-gray-700'}`}>
                {product.badge}
              </span>
            )}
            {discount && (
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                -{discount}%
              </span>
            )}
          </div>

          {/* Stock faible */}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center">
              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500 text-white">
                Plus que {product.stock} en stock !
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* ─── CONTENU ─── */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 gap-1.5 sm:gap-2">

        {/* Sous-catégorie — masquée sur mobile */}
        <p className="hidden sm:block text-xs text-gray-400 font-medium uppercase tracking-wide truncate">
          {product.subcategory}
        </p>

        {/* Nom du produit */}
        <Link href={`/produits/${product.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 text-[13px] sm:text-sm leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Note — masquée sur mobile */}
        <div className="hidden sm:flex items-center gap-1">
          <span className="text-yellow-400 text-xs">
            {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}
          </span>
          <span className="text-xs text-gray-400">({product.reviews})</span>
        </div>

        {/* Prix */}
        <div className="mt-auto pt-1">
          {/* Mobile : prix court */}
          <div className="sm:hidden flex items-baseline gap-1 mb-2">
            <span className="text-sm font-bold text-blue-600 leading-none">
              {formatPriceMobile(product.price)}
            </span>
            {discount && (
              <span className="text-[10px] font-bold text-red-500">-{discount}%</span>
            )}
          </div>

          {/* Desktop : prix complet */}
          <div className="hidden sm:flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-blue-600">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Bouton */}
          <button
            onClick={() => addItem(product)}
            className="w-full bg-blue-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-1.5
                       py-2 text-xs sm:py-2.5 sm:text-sm"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {/* Mobile : icône + texte court */}
            <span className="sm:hidden">Ajouter</span>
            {/* Desktop : texte complet */}
            <span className="hidden sm:inline">Ajouter au panier</span>
          </button>
        </div>
      </div>
    </div>
  );
}
