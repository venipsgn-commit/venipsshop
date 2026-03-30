'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product, formatPrice } from '@/lib/products';
import { useCart } from '@/context/CartContext';

const badgeColors: Record<string, string> = {
  'Nouveau': 'bg-green-100 text-green-700',
  'Promo': 'bg-red-100 text-red-700',
  'Populaire': 'bg-orange-100 text-orange-700',
  'Gaming': 'bg-purple-100 text-purple-700',
  'Best Seller': 'bg-blue-100 text-blue-700',
  'Top Rated': 'bg-yellow-100 text-yellow-700',
};

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden border border-gray-100 flex flex-col">

      {/* Image */}
      <Link href={`/produits/${product.id}`} className="block">
        <div className="relative h-36 sm:h-52 bg-gray-50 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
          {/* Badges top-left */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.badge && (
              <span className={`text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-full ${badgeColors[product.badge] ?? 'bg-gray-100 text-gray-700'}`}>
                {product.badge}
              </span>
            )}
            {discount && (
              <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                -{discount}%
              </span>
            )}
          </div>
          {/* Stock alert top-right */}
          {product.stock <= 5 && (
            <div className="absolute top-2 right-2">
              <span className="text-[10px] sm:text-xs font-medium px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
                +{product.stock} restants
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1">
        <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5 sm:mb-1 truncate">
          {product.subcategory}
        </p>

        <Link href={`/produits/${product.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 text-xs sm:text-sm leading-snug mb-1.5 sm:mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating — hidden on very small screens, shown on sm+ */}
        <div className="hidden sm:flex items-center gap-1 mb-2">
          <div className="flex text-yellow-400 text-xs">
            {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}
          </div>
          <span className="text-xs text-gray-400">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="mt-auto">
          <div className="flex flex-wrap items-baseline gap-1 mb-2 sm:mb-3">
            <span className="text-sm sm:text-lg font-bold text-blue-600 leading-tight">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] sm:text-sm text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Add to cart */}
          <button
            onClick={() => addItem(product)}
            className="w-full bg-blue-600 text-white py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="hidden xs:inline sm:inline">Ajouter</span>
            <span className="sm:hidden">+ Panier</span>
          </button>
        </div>
      </div>
    </div>
  );
}
