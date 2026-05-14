'use client';
import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { productApi, type Product, type Review } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ui/ProductCard';
import { pixel } from '@/lib/pixel';

export default function ProductPageClient({ product, related }: { product: Product; related: Product[] }) {
  const { addItem } = useCart();
  const { has: isInWishlist, toggle: toggleWishlist } = useWishlist();

  useEffect(() => {
    pixel.viewContent({ id: product.id, name: product.name, price: product.price });
  }, [product.id, product.name, product.price]);

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  const handleAddToCart = useCallback(() => {
    for (let i = 0; i < qty; i++) addItem(product as any);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [product, qty, addItem]);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="bg-white dark:bg-black min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
            <Link href="/" className="hover:text-teal-500 transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/catalogue" className="hover:text-teal-500 transition-colors">Catalogue</Link>
            <span>/</span>
            {product.category && (
              <>
                <Link href={`/catalogue?cat=${product.category.slug}`} className="hover:text-teal-500 transition-colors capitalize">
                  {product.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px] font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

          {/* ── GALERIE ── */}
          <div className="space-y-3">
            <div className="relative rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800" style={{height: '460px'}}>
              <Image
                src={product.images[activeImg] || product.images[0]}
                alt={product.name}
                fill
                className="object-contain p-6 transition-opacity duration-300"
                unoptimized
                priority
              />

              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.badge && (
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-md ${
                    product.badge === 'Promo' || product.badge === 'PROMO' ? 'bg-red-500 text-white' :
                    product.badge === 'Nouveau' || product.badge === 'NOUVEAU' ? 'bg-emerald-500 text-white' :
                    product.badge === 'Populaire' || product.badge === 'POPULAIRE' ? 'bg-blue-600 text-white' : 'bg-violet-600 text-white'
                  }`}>{product.badge.replace('_', ' ')}</span>
                )}
                {discount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md">
                    -{discount}%
                  </span>
                )}
              </div>

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg(i => (i - 1 + product.images.length) % product.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveImg(i => (i + 1) % product.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                  >
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </>
              )}

              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {product.images.map((_, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`rounded-full transition-all ${activeImg === i ? 'w-5 h-2 bg-teal-500' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImg === i
                        ? 'border-teal-500 shadow-md shadow-teal-500/20 scale-105'
                        : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="" width={80} height={80} className="object-cover w-full h-full" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── INFO PRODUIT ── */}
          <div className="flex flex-col">
            <p className="text-sm font-bold text-teal-500 uppercase tracking-widest mb-2">{product.brand}</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{product.rating}</span>
              <span className="text-sm text-gray-400">{product.reviewCount} avis</span>
              <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${
                product.stock > 10 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' :
                product.stock > 0  ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600' :
                'bg-red-50 dark:bg-red-900/30 text-red-600'
              }`}>
                {product.stock > 10 ? '● En stock' : product.stock > 0 ? `⚡ ${product.stock} restants` : '● Rupture'}
              </span>
            </div>

            <div className="mb-5">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                )}
                {discount > 0 && (
                  <span className="bg-red-500 text-white text-sm font-extrabold px-2.5 py-1 rounded-full">-{discount}%</span>
                )}
              </div>
              {product.originalPrice && (
                <p className="text-sm text-emerald-600 font-semibold mt-1">
                  Vous économisez {formatPrice(product.originalPrice - product.price)} 🎉
                </p>
              )}
            </div>

            {product.shortDesc && (
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-5">{product.shortDesc}</p>
            )}

            <ul className="grid grid-cols-1 gap-2 mb-6">
              {product.features.slice(0, 4).map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-teal-600" style={{background: 'rgba(0,200,200,0.1)'}}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-11 h-12 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-xl font-light transition-colors">−</button>
                <span className="w-10 text-center font-bold text-gray-900 dark:text-white text-sm">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-11 h-12 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-xl font-light transition-colors">+</button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 h-12 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                style={product.stock > 0 && !added ? {
                  background: 'linear-gradient(135deg, #22c55e, #15803d)',
                  boxShadow: '0 8px 20px rgba(34,197,94,0.3)',
                  color: 'white'
                } : {}}
              >
                {added ? (
                  <><span className="text-green-500 text-lg">✓</span><span className="text-green-600">Ajouté !</span></>
                ) : product.stock === 0 ? (
                  <span className="text-gray-400">Rupture de stock</span>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <span className="text-white">Ajouter au panier</span>
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                  inWishlist ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-500' : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-red-300 hover:text-red-400'
                }`}
              >
                <svg className="w-5 h-5" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-5 border-t border-gray-100 dark:border-gray-800">
              {[['🔒','Paiement','sécurisé'],['🚚','Livraison','partout en Guinée'],['↩️','Retours','30 jours']].map(([icon,t1,t2]) => (
                <div key={t1} className="flex flex-col items-center text-center gap-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                  <span className="text-2xl">{icon}</span>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{t1}</p>
                  <p className="text-[10px] text-gray-400">{t2}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="mb-16">
          <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-6">
            {(['desc','specs','reviews'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-semibold transition-all rounded-t-xl ${
                  activeTab === tab
                    ? 'text-teal-600 border-b-2 border-teal-500 bg-teal-50/50 dark:bg-teal-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}>
                {tab === 'desc' ? 'Description' : tab === 'specs' ? 'Caractéristiques' : `Avis clients (${product.reviews?.length ?? 0})`}
              </button>
            ))}
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6">
            {activeTab === 'desc' && (
              <div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{product.description}</p>
                {product.features.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-base">Points forts</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {product.features.map(f => (
                        <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-xl px-4 py-2.5 shadow-sm border border-gray-100 dark:border-gray-700">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-teal-600 flex-shrink-0" style={{background: 'rgba(0,200,200,0.12)'}}>✓</span>
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
                {Object.keys(product.specs).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">Aucune caractéristique disponible.</p>
                ) : (
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(product.specs).map(([key, val], i) => (
                        <tr key={key} className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-900/50'}>
                          <td className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-200 w-2/5 rounded-l-lg">{key}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300 rounded-r-lg">{String(val)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <ReviewsTab product={product} />
            )}
          </div>
        </div>

        {/* ── PRODUITS SIMILAIRES ── */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Produits similaires</h2>
              {product.category && (
                <Link href={`/catalogue?cat=${product.category.slug}`} className="text-sm font-semibold text-teal-500 hover:text-teal-600">
                  Voir tout →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Onglet avis ──────────────────────────────────────────────────
function ReviewsTab({ product }: { product: Product }) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(product.reviews ?? []);
  const [error, setError] = useState('');

  const submitReview = async () => {
    if (!user) { setError('Connectez-vous pour laisser un avis.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const r = await productApi.addReview(product.id, rating, comment.trim() || undefined);
      setReviews(prev => [r, ...prev]);
      setComment('');
      setRating(5);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulaire avis */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h4 className="font-bold text-gray-900 dark:text-white mb-4">Laisser un avis</h4>
        <div className="flex gap-1 mb-3">
          {[1,2,3,4,5].map(s => (
            <button key={s} onClick={() => setRating(s)}>
              <svg className={`w-7 h-7 transition-colors ${s <= rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700 hover:text-yellow-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Partagez votre expérience avec ce produit..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        <button onClick={submitReview} disabled={submitting}
          className="mt-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
          {submitting ? 'Envoi...' : 'Publier mon avis'}
        </button>
      </div>

      {/* Liste avis */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-gray-500 font-medium">Aucun avis pour le moment</p>
          <p className="text-gray-400 text-sm mt-1">Soyez le premier à donner votre avis</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => {
            const name = r.user ? `${r.user.prenom} ${r.user.nom}` : 'Client';
            return (
              <div key={r.id} className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm">
                      {name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{name}</p>
                      <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{r.comment}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
