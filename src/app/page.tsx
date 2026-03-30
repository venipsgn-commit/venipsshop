import Link from 'next/link';
import Image from 'next/image';
import { products, getFeaturedProducts, categoryInfo, formatPrice } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const featured = getFeaturedProducts();
  const newArrivals = products.filter((p) => p.badge === 'Nouveau');

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-20 w-96 h-96 bg-indigo-300 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-blue-500/30 border border-blue-400/30 text-blue-100 text-sm px-3 py-1 rounded-full mb-4">
                🎉 Livraison gratuite dès 150 000 FCFA
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
                La tech à votre portée,<br />
                <span className="text-blue-200">au meilleur prix</span>
              </h1>
              <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                Ordinateurs, téléphones et accessoires high-tech de qualité. Large gamme de produits, livraison rapide et service client disponible.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/categorie/ordinateurs"
                  className="bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Explorer les produits
                </Link>
                <Link
                  href="/categorie/telephones"
                  className="border border-white/40 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
                >
                  Voir les téléphones
                </Link>
              </div>
              <div className="flex flex-wrap gap-4 mt-8 text-sm text-blue-200">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  Produits authentiques
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  Garantie constructeur
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  Retours 30 jours
                </span>
              </div>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden h-48 relative shadow-xl">
                  <Image src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80" alt="MacBook" fill className="object-cover" unoptimized />
                </div>
                <div className="rounded-2xl overflow-hidden h-36 relative shadow-xl">
                  <Image src="https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400&q=80" alt="AirPods" fill className="object-cover" unoptimized />
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="rounded-2xl overflow-hidden h-36 relative shadow-xl">
                  <Image src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80" alt="iPhone" fill className="object-cover" unoptimized />
                </div>
                <div className="rounded-2xl overflow-hidden h-48 relative shadow-xl">
                  <Image src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80" alt="Samsung" fill className="object-cover" unoptimized />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '500+', label: 'Produits disponibles' },
              { value: '50+', label: 'Marques référencées' },
              { value: '10 000+', label: 'Clients satisfaits' },
              { value: '4.8★', label: 'Note moyenne' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Nos Catégories</h2>
        <div className="grid grid-cols-3 md:grid-cols-3 gap-3 sm:gap-6">
          {(Object.entries(categoryInfo) as [string, typeof categoryInfo[keyof typeof categoryInfo]][]).map(([key, info]) => {
            const bgMap: Record<string, string> = {
              blue: 'bg-blue-50 hover:bg-blue-100',
              purple: 'bg-purple-50 hover:bg-purple-100',
              emerald: 'bg-emerald-50 hover:bg-emerald-100',
            };
            const count = products.filter((p) => p.category === key).length;
            return (
              <Link
                key={key}
                href={`/categorie/${key}`}
                className={`${bgMap[info.color]} rounded-xl sm:rounded-2xl p-4 sm:p-8 flex flex-col items-center text-center transition-colors group`}
              >
                <span className="text-3xl sm:text-5xl mb-2 sm:mb-4 group-hover:scale-110 transition-transform inline-block">{info.icon}</span>
                <h3 className="text-sm sm:text-xl font-bold text-gray-900 mb-0.5 sm:mb-1">{info.label}</h3>
                <p className="text-gray-500 text-[10px] sm:text-sm hidden sm:block mb-3">{info.description}</p>
                <span className="text-[10px] sm:text-xs font-semibold text-gray-400 bg-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full mt-1">
                  {count} produits
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="bg-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Nouveautés</h2>
              <p className="text-gray-500 text-sm">Les derniers produits arrivés en stock</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Produits à la Une</h2>
          <p className="text-gray-500 text-sm">Sélection de nos meilleures offres</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-orange-400 font-semibold text-sm uppercase tracking-wider">Offre spéciale</span>
              <h2 className="text-3xl font-bold mt-2 mb-4">
                Jusqu&apos;à <span className="text-orange-400">-25%</span> sur les accessoires
              </h2>
              <p className="text-gray-400 mb-6">Profitez de nos promotions sur une large sélection d&apos;accessoires pour ordinateurs et téléphones.</p>
              <Link
                href="/categorie/accessoires"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Voir les offres
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {products.filter((p) => p.category === 'accessoires' && p.originalPrice).slice(0, 4).map((product) => (
                <div key={product.id} className="bg-gray-800 rounded-xl p-3">
                  <div className="relative h-24 rounded-lg overflow-hidden mb-2">
                    <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
                  </div>
                  <p className="text-xs font-medium truncate text-gray-200">{product.name}</p>
                  <p className="text-orange-400 text-sm font-bold">{formatPrice(product.price)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '🚚', title: 'Livraison Rapide', desc: 'Livraison en 24-48h sur Dakar, 3-5 jours en région' },
            { icon: '🔒', title: 'Paiement Sécurisé', desc: 'Transactions sécurisées via Orange Money, Wave et CB' },
            { icon: '↩️', title: 'Retours Gratuits', desc: '30 jours pour retourner un produit sans frais' },
            { icon: '💬', title: 'Support 7j/7', desc: 'Notre équipe est disponible pour vous aider' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
