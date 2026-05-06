'use client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import { productApi, categoryApi, type Product, type Category } from '@/lib/api';
import { products as fallbackProducts } from '@/lib/data/products';

function CatalogueContent() {
  const searchParams = useSearchParams();
  const initCat = searchParams.get('cat') ?? 'all';
  const initQ = searchParams.get('q') ?? '';

  const [cat, setCat] = useState(initCat);
  const [q, setQ] = useState(initQ);
  const [sort, setSort] = useState('createdAt_desc');
  const [maxPrice, setMaxPrice] = useState(20000000);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch categories
  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => {});
  }, []);

  // Fetch products from API
  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = { page, limit: 12 };
    if (cat !== 'all') params.category = cat;
    if (q.trim()) params.search = q;
    if (maxPrice < 20000000) params.maxPrice = maxPrice;
    if (sort) params.sort = sort;

    productApi.list(params)
      .then(res => {
        setProducts(res.products);
        setTotalPages(res.pagination.pages);
        setTotal(res.pagination.total);
      })
      .catch(() => {
        // Fallback to hardcoded products if API unavailable
        const mapped = fallbackProducts.map((p: any) => ({
          id: p.id, name: p.name, slug: p.slug || p.id,
          description: p.description, shortDesc: p.shortDesc,
          price: p.price, originalPrice: p.originalPrice || null,
          stock: p.stock, categoryId: p.category,
          category: { name: p.category, slug: p.category },
          brand: p.brand, badge: p.badge,
          images: p.images, features: p.features || [],
          specs: p.specs || {}, rating: p.rating || 0,
          reviewCount: p.reviews?.length || 0,
          isActive: true, createdAt: new Date().toISOString(),
        })) as Product[];
        setProducts(mapped);
        setTotal(mapped.length);
      })
      .finally(() => setLoading(false));
  }, [cat, q, sort, maxPrice, page]);

  const allBrands = useMemo(() => [...new Set(products.map(p => p.brand))].sort(), [products]);

  const filtered = useMemo(() => {
    if (selectedBrands.length === 0) return products;
    return products.filter(p => selectedBrands.includes(p.brand));
  }, [products, selectedBrands]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
    setPage(1);
  };

  const handleCatChange = (c: string) => { setCat(c); setPage(1); };
  const handleSearch = (v: string) => { setQ(v); setPage(1); };
  const handleSort = (v: string) => { setSort(v); setPage(1); };
  const handlePrice = (v: number) => { setMaxPrice(v); setPage(1); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Catalogue</h1>
        <p className="text-gray-500 text-sm">{total} produit{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        <button onClick={() => handleCatChange('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${cat === 'all' ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-teal-50 border border-gray-200'}`}>
          Tout
        </button>
        {categories.map(c => (
          <button key={c.id} onClick={() => handleCatChange(c.slug)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${cat === c.slug ? 'bg-teal-500 text-white' : 'bg-white text-gray-700 hover:bg-teal-50 border border-gray-200'}`}>
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters - desktop */}
        <div className="hidden lg:block w-60 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-6 sticky top-24">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Recherche</h3>
              <input value={q} onChange={e => handleSearch(e.target.value)} placeholder="Nom, marque..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                Prix max: {maxPrice >= 20000000 ? 'Tous' : `${Math.round(maxPrice/1000)}K GNF`}
              </h3>
              <input type="range" min={100000} max={20000000} step={100000} value={maxPrice}
                onChange={e => handlePrice(Number(e.target.value))} className="w-full accent-teal-500" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>100K</span><span>20M</span></div>
            </div>
            {allBrands.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Marques</h3>
                <div className="space-y-2">
                  {allBrands.map(b => (
                    <label key={b} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)} className="accent-teal-500" />
                      <span className="text-sm text-gray-700">{b}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {(selectedBrands.length > 0 || maxPrice < 20000000 || q) && (
              <button onClick={() => { setSelectedBrands([]); setMaxPrice(20000000); handleSearch(''); }}
                className="w-full text-sm text-teal-500 hover:text-teal-600 font-medium py-2 border border-teal-200 rounded-xl">
                Réinitialiser
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
            <select value={sort} onChange={e => handleSort(e.target.value)}
              className="ml-auto px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="createdAt_desc">Nouveautés</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="rating_desc">Mieux notés</option>
            </select>
          </div>

          {/* Mobile filters */}
          {showFilters && (
            <div className="lg:hidden bg-white rounded-2xl border border-gray-100 p-5 mb-4 space-y-4">
              <input value={q} onChange={e => handleSearch(e.target.value)} placeholder="Rechercher..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Prix max: {maxPrice >= 20000000 ? 'Tous' : `${Math.round(maxPrice/1000)}K GNF`}
                </p>
                <input type="range" min={100000} max={20000000} step={100000} value={maxPrice}
                  onChange={e => handlePrice(Number(e.target.value))} className="w-full accent-teal-500" />
              </div>
              <div className="flex flex-wrap gap-2">
                {allBrands.map(b => (
                  <button key={b} onClick={() => toggleBrand(b)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedBrands.includes(b) ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-gray-700 border-gray-200'}`}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-500 mb-6">Essayez de modifier vos filtres</p>
              <button onClick={() => { handleCatChange('all'); handleSearch(''); setSelectedBrands([]); setMaxPrice(20000000); }}
                className="bg-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-600 transition-colors">
                Voir tous les produits
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-5">
                {filtered.map(p => <ProductCard key={p.id} product={p as any} />)}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:border-teal-400 transition-colors">
                    ← Précédent
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-600">{page} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:border-teal-400 transition-colors">
                    Suivant →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CatalogueClient() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-2xl" />)}
        </div>
      </div>
    }>
      <CatalogueContent />
    </Suspense>
  );
}
