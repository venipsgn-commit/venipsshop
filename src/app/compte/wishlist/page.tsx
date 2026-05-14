'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AccountLayout from '@/components/layout/AccountLayout';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { productApi, type Product } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function WishlistPage() {
  const { user } = useAuth();
  const { ids, toggle: toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const idsKey = ids.join(',');

  useEffect(() => {
    if (!user) return;
    if (ids.length === 0) { setProducts([]); return; }
    setLoading(true);
    productApi.getWishlist()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, idsKey]);

  if (!user) return null;

  return (
    <AccountLayout>
      <div>
        <h1 className="text-xl font-extrabold text-gray-900 dark:text-slate-100 mb-5">
          Ma Wishlist <span className="text-gray-400 dark:text-slate-500 font-normal text-base">({products.length})</span>
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-12 text-center">
            <p className="text-5xl mb-3">❤️</p>
            <p className="font-semibold text-gray-900 dark:text-slate-100 mb-2">Votre wishlist est vide</p>
            <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">Ajoutez des produits en cliquant sur le cœur.</p>
            <Link href="/catalogue" className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all">
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map(product => {
              const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
              return (
                <div key={product.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 flex gap-4">
                  <Link href={`/produit/${product.slug}`} className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-700 flex-shrink-0">
                    <Image src={product.images[0]} alt={product.name} fill className="object-contain p-2" unoptimized />
                    {discount > 0 && <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">-{discount}%</span>}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-teal-500 font-semibold">{product.brand}</p>
                    <Link href={`/produit/${product.slug}`} className="text-sm font-semibold text-gray-900 dark:text-slate-100 hover:text-teal-500 line-clamp-2">{product.name}</Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-gray-900 dark:text-slate-100 text-sm">{formatPrice(product.price)}</span>
                      {product.originalPrice && <span className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => addItem(product as any)}
                        disabled={product.stock === 0}
                        className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-200 dark:disabled:bg-slate-700 disabled:text-gray-400 dark:disabled:text-slate-500 text-white text-xs font-bold py-2 rounded-xl transition-all"
                      >
                        {product.stock === 0 ? 'Rupture' : 'Ajouter au panier'}
                      </button>
                      <button onClick={() => toggleWishlist(product.id)}
                        className="w-8 h-8 rounded-xl border border-red-200 dark:border-red-800 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center text-sm">
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
