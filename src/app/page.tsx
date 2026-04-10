'use client';
import Link from 'next/link';
import Image from 'next/image';
import { products, getFeaturedProducts, getNewProducts } from '@/lib/data/products';
import ProductCard from '@/components/ui/ProductCard';
import { formatPrice } from '@/lib/utils';

const CATEGORIES = [
  { key: 'telephones',  label: 'Téléphones',  icon: '📱', desc: 'Smartphones dernière génération', color: 'from-blue-500 to-blue-700' },
  { key: 'ordinateurs', label: 'Ordinateurs', icon: '💻', desc: 'Laptops & PC de bureau',          color: 'from-violet-500 to-violet-700' },
  { key: 'accessoires', label: 'Accessoires', icon: '🎧', desc: 'Écouteurs, chargeurs & plus',     color: 'from-emerald-500 to-emerald-700' },
  { key: 'gaming',      label: 'Gaming',      icon: '🎮', desc: 'Consoles & jeux vidéo',          color: 'from-red-500 to-red-700' },
  { key: 'tv-audio',   label: 'TV & Audio',  icon: '📺', desc: 'Télévisions & enceintes',        color: 'from-teal-500 to-teal-700' },
];

const TESTIMONIALS = [
  { name: 'Mamadou Diallo', role: 'Entrepreneur', note: 5, text: 'Livraison ultra rapide, produit conforme à la description. Je recommande Venips à 100% !', avatar: 'M' },
  { name: 'Fatou Camara',   role: 'Étudiante',    note: 5, text: 'Mon iPhone est arrivé en parfait état, emballage soigné. Service client très réactif.', avatar: 'F' },
  { name: 'Ibrahima Bah',   role: 'Ingénieur',    note: 5, text: 'J\'ai commandé un MacBook Pro, tout s\'est passé parfaitement. Prix compétitif en Guinée !', avatar: 'I' },
  { name: 'Aïssatou Barry', role: 'Médecin',       note: 4, text: 'Bonne expérience d\'achat en ligne. Paiement facile via Wave. Produits authentiques.', avatar: 'A' },
];

export default function HomePage() {
  const featured = getFeaturedProducts().slice(0, 8);
  const newArrivals = getNewProducts().slice(0, 4);
  const promoProducts = products.filter(p => p.originalPrice).slice(0, 4);

  return (
    <div>
      {/* ─── HERO ─── */}
      <section className="relative text-white overflow-hidden" style={{background: 'linear-gradient(135deg, #020B3A 0%, #041459 50%, #020B3A 100%)'}}>
        {/* Orbes lumineux */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" style={{background: 'radial-gradient(circle, rgba(0,216,216,0.12) 0%, transparent 70%)'}} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" style={{background: 'radial-gradient(circle, rgba(0,160,160,0.08) 0%, transparent 70%)'}} />
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" style={{background: 'radial-gradient(circle, rgba(0,216,216,0.05) 0%, transparent 70%)'}} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="inline-flex items-center gap-2 border text-xs sm:text-sm px-4 py-2 rounded-full mb-6 font-medium" style={{background: 'rgba(0,216,216,0.1)', borderColor: 'rgba(0,216,216,0.3)', color: '#00D8D8'}}>
                🚚 Livraison partout en Guinée
              </span>
              <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6">
                La tech à votre portée,
                <span className="block mt-2" style={{color: '#00D8D8'}}>au meilleur prix</span>
              </h1>
              <p className="text-blue-200 text-base sm:text-lg mb-8 leading-relaxed max-w-lg">
                Téléphones, ordinateurs et accessoires high-tech de qualité. Large gamme de produits authentiques avec livraison partout en Guinée.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/catalogue" className="text-white px-7 py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-95" style={{background: 'linear-gradient(135deg, #22c55e, #15803d)', boxShadow: '0 8px 24px rgba(34,197,94,0.35)'}}>
                  Explorer le catalogue
                </Link>
                <Link href="/catalogue?cat=telephones" className="border border-white/20 hover:border-white/50 text-blue-200 hover:text-white px-7 py-3.5 rounded-xl font-semibold transition-all backdrop-blur-sm" style={{background: 'rgba(255,255,255,0.05)'}}>
                  Voir les téléphones
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 mt-10">
                {[['✓','Produits authentiques'],['✓','Garantie constructeur'],['✓','Retours 30 jours']].map(([icon,txt]) => (
                  <span key={txt} className="flex items-center gap-2 text-sm text-blue-200">
                    <span className="font-bold text-base" style={{color: '#00D8D8'}}>{icon}</span>{txt}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero images grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden h-52 relative shadow-2xl" style={{boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,216,216,0.15)'}}>
                  <Image src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80" alt="MacBook" fill className="object-cover" unoptimized />
                </div>
                <div className="rounded-2xl overflow-hidden h-40 relative shadow-2xl" style={{boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,216,216,0.15)'}}>
                  <Image src="https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400&q=80" alt="Écouteurs" fill className="object-cover" unoptimized />
                </div>
              </div>
              <div className="space-y-4 mt-10">
                <div className="rounded-2xl overflow-hidden h-40 relative shadow-2xl" style={{boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,216,216,0.15)'}}>
                  <Image src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&q=80" alt="iPhone" fill className="object-cover" unoptimized />
                </div>
                <div className="rounded-2xl overflow-hidden h-52 relative shadow-2xl" style={{boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,216,216,0.15)'}}>
                  <Image src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=80" alt="Samsung" fill className="object-cover" unoptimized />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vague de transition vers le blanc */}
        <div className="absolute bottom-0 left-0 right-0 h-16" style={{background: 'linear-gradient(to bottom, transparent, white)'}} />
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[['500+','Produits disponibles'],['50+','Marques référencées'],['10 000+','Clients satisfaits'],['4.8★','Note moyenne']].map(([val,lbl]) => (
              <div key={lbl} className="py-2">
                <p className="text-2xl sm:text-3xl font-extrabold text-teal-500">{val}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Nos Catégories</h2>
          <p className="text-gray-500 mt-2 text-sm">Trouvez exactement ce dont vous avez besoin</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {CATEGORIES.map(cat => {
            const count = products.filter(p => p.category === cat.key).length;
            return (
              <Link key={cat.key} href={`/catalogue?cat=${cat.key}`}
                className="group relative overflow-hidden rounded-2xl bg-gray-900 text-white p-4 sm:p-6 flex flex-col items-center text-center hover:scale-105 transition-transform shadow-sm">
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
                <span className="text-3xl sm:text-4xl mb-2 relative z-10">{cat.icon}</span>
                <h3 className="font-bold text-sm sm:text-base relative z-10">{cat.label}</h3>
                <p className="text-gray-400 text-[10px] sm:text-xs mt-1 relative z-10 hidden sm:block">{cat.desc}</p>
                <span className="mt-2 text-[10px] sm:text-xs bg-white/10 px-2 py-0.5 rounded-full relative z-10">{count} produits</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── NOUVEAUTÉS ─── */}
      {newArrivals.length > 0 && (
        <section className="bg-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Nouveautés</h2>
                <p className="text-gray-500 text-sm mt-1">Les derniers arrivages en stock</p>
              </div>
              <Link href="/catalogue?badge=Nouveau" className="text-sm font-semibold text-teal-500 hover:text-teal-600 transition-colors">
                Voir tout →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ─── PROMO BANNER ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>
          <div className="relative z-10 px-6 sm:px-12 py-8 sm:py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-white text-center sm:text-left">
              <p className="text-sm font-semibold uppercase tracking-widest text-red-100">Offre spéciale</p>
              <h2 className="text-2xl sm:text-4xl font-extrabold mt-1">Jusqu&apos;à <span className="text-white">-25%</span></h2>
              <p className="text-red-100 mt-1">Utilisez le code <strong className="bg-white/20 px-2 py-0.5 rounded font-mono">NOEL25</strong> à la caisse</p>
            </div>
            <Link href="/catalogue" className="bg-white text-red-600 hover:bg-red-50 font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg whitespace-nowrap">
              Profiter de l&apos;offre
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PRODUITS VEDETTES ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Produits Populaires</h2>
            <p className="text-gray-500 text-sm mt-1">Les meilleures ventes du moment</p>
          </div>
          <Link href="/catalogue" className="text-sm font-semibold text-teal-500 hover:text-teal-600 transition-colors">
            Voir tout →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ─── PROMOTIONS ─── */}
      {promoProducts.length > 0 && (
        <section className="bg-gray-900 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Promotions</h2>
                <p className="text-gray-400 text-sm mt-1">Offres à durée limitée</p>
              </div>
              <Link href="/catalogue?badge=Promo" className="text-sm font-semibold text-teal-400 hover:text-teal-300">Voir tout →</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {promoProducts.map(p => {
                const disc = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
                return (
                  <Link key={p.id} href={`/produit/${p.id}`} className="bg-gray-800 hover:bg-gray-700 rounded-2xl p-3 sm:p-4 transition-colors group">
                    <div className="relative h-32 sm:h-40 rounded-xl overflow-hidden mb-3">
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                      {disc > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{disc}%</span>}
                    </div>
                    <p className="text-xs font-semibold text-teal-400 uppercase mb-0.5">{p.brand}</p>
                    <p className="text-white text-sm font-semibold line-clamp-2 mb-2">{p.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-teal-400 font-bold text-sm">{formatPrice(p.price)}</span>
                      {p.originalPrice && <span className="text-gray-500 text-xs line-through">{formatPrice(p.originalPrice)}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── AVIS CLIENTS ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Ce que disent nos clients</h2>
          <p className="text-gray-500 mt-2 text-sm">Plus de 10 000 clients satisfaits</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex gap-0.5 mb-3">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className={`w-4 h-4 ${s <= t.note ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{t.avatar}</div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🚚', title: 'Livraison Rapide', desc: '24-48h sur Conakry, partout en Guinée' },
              { icon: '🔒', title: 'Paiement Sécurisé', desc: 'Wave, Orange Money, carte bancaire' },
              { icon: '↩️', title: 'Retours Gratuits', desc: '30 jours pour retourner sans frais' },
              { icon: '💬', title: 'Support 7j/7', desc: 'Équipe disponible par chat et téléphone' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">{f.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ─── */}
      <section className="bg-gray-50 py-14 border-t border-gray-100">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">Restez informé des offres</h2>
          <p className="text-gray-500 text-sm mb-6">Recevez nos meilleures promotions directement dans votre boîte mail.</p>
          <form onSubmit={e => e.preventDefault()} className="flex gap-2">
            <input type="email" placeholder="Votre adresse email" className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
            <button type="submit" className="text-white px-5 py-3 rounded-xl font-semibold transition-colors text-sm whitespace-nowrap" style={{background: 'linear-gradient(135deg, #22c55e, #15803d)'}}>S&apos;abonner</button>
          </form>
        </div>
      </section>
    </div>
  );
}
