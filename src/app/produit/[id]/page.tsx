'use client';
import { useState, useCallback } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductById, products } from '@/lib/data/products';
import { formatPrice, formatPriceShort } from '@/lib/storage';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function ProductPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? '');
  const product = getProductById(id);

  const { addItem } = useCart();
  const { has: isInWishlist, toggle: toggleWishlist } = useWishlist();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    for (let i = 0; i < qty; i++) addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [product, qty, addItem]);

  if (!product) notFound();

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const inWishlist = isInWishlist(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-orange-500">Accueil</Link>
        <span>/</span>
        <Link href="/catalogue" className="hover:text-orange-500">Catalogue</Link>
        <span>/</span>
        <Link href={`/catalogue?cat=${product.category}`} className="hover:text-orange-500 capitalize">{product.category}</Link>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
        {/* Images */}
        <div>
          <div className="relative h-72 sm:h-[420px] rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm mb-3">
            <Image
              src={product.images[activeImg] || product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-4"
              unoptimized
            />
            {product.badge && (
              <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white ${
                product.badge === 'Promo' ? 'bg-red-500' :
                product.badge === 'Nouveau' ? 'bg-green-500' :
                product.badge === 'Populaire' ? 'bg-orange-500' : 'bg-violet-500'
              }`}>
                {product.badge}
                {discount > 0 && ` -${discount}%`}
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-orange-500' : 'border-gray-200 hover:border-gray-400'}`}>
                  <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-1">{product.brand}</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
            <span className="text-sm text-gray-400">({product.reviewCount} avis)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-extrabold text-gray-900">{formatPriceShort(product.price)}</span>
            {product.originalPrice && (
              <span className="text-lg text-gray-400 line-through">{formatPriceShort(product.originalPrice)}</span>
            )}
            {discount > 0 && (
              <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-lg">-{discount}%</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-4">Prix TTC : {formatPrice(product.price)}</p>

          {/* Short desc */}
          <p className="text-gray-600 text-sm leading-relaxed mb-5">{product.shortDesc}</p>

          {/* Features */}
          <ul className="grid grid-cols-2 gap-1.5 mb-6">
            {product.features.slice(0, 6).map(f => (
              <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {/* Stock */}
          <div className="mb-5">
            {product.stock > 10 ? (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                En stock ({product.stock} disponibles)
              </span>
            ) : product.stock > 0 ? (
              <span className="flex items-center gap-1.5 text-sm text-orange-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Plus que {product.stock} en stock !
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Rupture de stock
              </span>
            )}
          </div>

          {/* Qty + Add to cart */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 text-gray-600 text-lg font-bold">−</button>
              <span className="w-10 text-center font-semibold text-gray-900">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 text-gray-600 text-lg font-bold">+</button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                added ? 'bg-green-500 text-white' :
                product.stock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
                'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25 active:scale-95'
              }`}
            >
              {added ? '✓ Ajouté au panier' : product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all ${inWishlist ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-200 text-gray-400 hover:border-red-400 hover:text-red-400'}`}
            >
              <svg className="w-5 h-5" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-gray-100">
            {[['🔒','Paiement sécurisé'],['🚚','Livraison rapide'],['↩️','Retours 30j']].map(([icon,txt]) => (
              <div key={txt} className="flex flex-col items-center text-center gap-1">
                <span className="text-xl">{icon}</span>
                <span className="text-xs text-gray-500">{txt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden mb-14">
        <div className="flex border-b border-gray-200 bg-gray-50">
          {(['desc','specs','reviews'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${activeTab === tab ? 'bg-white text-orange-500 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-900'}`}>
              {tab === 'desc' ? 'Description' : tab === 'specs' ? 'Caractéristiques' : `Avis (${product.reviews.length})`}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === 'desc' && (
            <div>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
              {product.features.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-bold text-gray-900 mb-3">Points forts</h3>
                  <ul className="space-y-2">
                    {product.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {activeTab === 'specs' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.specs).map(([key, val], i) => (
                    <tr key={key} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-2.5 px-4 font-semibold text-gray-700 w-1/3">{key}</td>
                      <td className="py-2.5 px-4 text-gray-600">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div>
              {product.reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucun avis pour le moment.</p>
              ) : (
                <div className="space-y-4">
                  {product.reviews.map(r => (
                    <div key={r.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{r.userName}</p>
                          <p className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <svg key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-5">Produits similaires</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map(p => (
              <Link key={p.id} href={`/produit/${p.id}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                <div className="relative h-32 bg-gray-50">
                  <Image src={p.images[0]} alt={p.name} fill className="object-contain p-2 group-hover:scale-105 transition-transform" unoptimized />
                </div>
                <div className="p-3">
                  <p className="text-xs text-orange-500 font-semibold">{p.brand}</p>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">{p.name}</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{formatPriceShort(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
