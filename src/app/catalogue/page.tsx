'use client';
import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import { products } from '@/lib/data/products';

const CATEGORIES = [
  { id: 'all', label: 'Tout' },
  { id: 'telephones', label: 'Téléphones' },
  { id: 'ordinateurs', label: 'Ordinateurs' },
  { id: 'accessoires', label: 'Accessoires' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'tv-audio', label: 'TV & Audio' },
];

function CatalogueContent() {
  const searchParams = useSearchParams();
  const initCat = searchParams.get('cat') ?? 'all';
  const initQ = searchParams.get('q') ?? '';

  const [cat, setCat] = useState(initCat);
  const [q, setQ] = useState(initQ);
  const [sort, setSort] = useState('popular');
  const [maxPrice, setMaxPrice] = useState(2000000);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const allBrands = useMemo(() => [...new Set(products.map(p => p.brand))].sort(), []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (cat !== 'all') list = list.filter(p => p.category === cat);
    if (q.trim()) {
      const lq = q.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(lq) || p.brand.toLowerCase().includes(lq) || p.shortDesc.toLowerCase().includes(lq));
    }
    list = list.filter(p => p.price <= maxPrice);
    if (selectedBrands.length > 0) list = list.filter(p => selectedBrands.includes(p.brand));
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sort === 'new') list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    return list;
  }, [cat, q, sort, maxPrice, selectedBrands]);

  const toggleBrand = (brand: string) => setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Catalogue</h1>
        <p className="text-gray-500 text-sm">{filtered.length} produit{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${cat === c.id ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'}`}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters - desktop */}
        <div className="hidden lg:block w-60 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-6 sticky top-24">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Recherche</h3>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Nom, marque..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Prix max: {maxPrice >= 2000000 ? 'Tous' : `${Math.round(maxPrice/1000)}K GNF`}</h3>
              <input type="range" min={50000} max={2000000} step={50000} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-full accent-orange-500" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>50K</span><span>2M</span></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Marques</h3>
              <div className="space-y-2">
                {allBrands.map(b => (
                  <label key={b} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)} className="accent-orange-500" />
                    <span className="text-sm text-gray-700">{b}</span>
                  </label>
                ))}
              </div>
            </div>
            {(selectedBrands.length > 0 || maxPrice < 2000000 || q) && (
              <button onClick={() => { setSelectedBrands([]); setMaxPrice(2000000); setQ(''); }} className="w-full text-sm text-orange-500 hover:text-orange-600 font-medium py-2 border border-orange-200 rounded-xl">
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4 gap-3">
            <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white">
              ⚙️ Filtres
            </button>
            <select value={sort} onChange={e => setSort(e.target.value)} className="ml-auto px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="popular">Populaires</option>
              <option value="new">Nouveautés</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="rating">Mieux notés</option>
            </select>
          </div>

          {/* Mobile filters */}
          {showFilters && (
            <div className="lg:hidden bg-white rounded-2xl border border-gray-100 p-5 mb-4 space-y-4">
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Prix max: {maxPrice >= 2000000 ? 'Tous' : `${Math.round(maxPrice/1000)}K GNF`}</p>
                <input type="range" min={50000} max={2000000} step={50000} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-full accent-orange-500" />
              </div>
              <div className="flex flex-wrap gap-2">
                {allBrands.map(b => (
                  <button key={b} onClick={() => toggleBrand(b)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedBrands.includes(b) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-200'}`}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-500 mb-6">Essayez de modifier vos filtres</p>
              <button onClick={() => { setCat('all'); setQ(''); setSelectedBrands([]); setMaxPrice(2000000); }} className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors">
                Voir tous les produits
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-5">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CataloguePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse"><div className="h-8 bg-gray-200 rounded w-48 mb-6" /><div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">{Array.from({length: 6}).map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-2xl" />)}</div></div>}>
      <CatalogueContent />
    </Suspense>
  );
}
