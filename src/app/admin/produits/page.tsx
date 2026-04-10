'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/layout/AdminLayout';
import { productApi, categoryApi, type Product, type Category } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

const EMPTY_FORM = {
  name: '', brand: '', categoryId: '', price: 0, originalPrice: '',
  description: '', shortDesc: '', stock: 0,
  images: [''], features: [''], badge: '',
};

export default function AdminProduits() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      productApi.list({ limit: 100 }).then(r => setProducts(r.products)),
      categoryApi.list().then(setCategories),
    ]).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p => {
    const matchCat = catFilter === 'all' || p.category?.slug === catFilter;
    const q = search.toLowerCase();
    return matchCat && (!q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
  });

  const openCreate = () => {
    setEditingProduct(null);
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id || '' });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name, brand: p.brand, categoryId: p.categoryId,
      price: p.price, originalPrice: p.originalPrice?.toString() || '',
      description: p.description, shortDesc: p.shortDesc || '',
      stock: p.stock, images: p.images.length ? p.images : [''],
      features: p.features.length ? p.features : [''],
      badge: p.badge || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        name: form.name, brand: form.brand, categoryId: form.categoryId,
        price: Number(form.price), stock: Number(form.stock),
        description: form.description, shortDesc: form.shortDesc,
        images: form.images.filter(Boolean),
        features: form.features.filter(Boolean),
        badge: form.badge || null,
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      };

      if (editingProduct) {
        const updated = await productApi.update(editingProduct.id, payload);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
      } else {
        const created = await productApi.create(payload);
        setProducts(prev => [created, ...prev]);
      }
      setShowModal(false);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await productApi.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setDeleteConfirm(null);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const updateImage = (i: number, val: string) => {
    const imgs = [...form.images];
    imgs[i] = val;
    setForm(f => ({ ...f, images: imgs }));
  };

  const updateFeature = (i: number, val: string) => {
    const feats = [...form.features];
    feats[i] = val;
    setForm(f => ({ ...f, features: feats }));
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Produits <span className="text-gray-400 font-normal text-lg">({filtered.length})</span>
          </h1>
          <button onClick={openCreate}
            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
            ➕ Nouveau produit
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setCatFilter('all')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${catFilter === 'all' ? 'bg-teal-500 text-white' : 'border border-gray-200 text-gray-600 hover:border-teal-300'}`}>
              Tous
            </button>
            {categories.map(c => (
              <button key={c.id} onClick={() => setCatFilter(c.slug)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${catFilter === c.slug ? 'bg-teal-500 text-white' : 'border border-gray-200 text-gray-600 hover:border-teal-300'}`}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            Aucun produit trouvé.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-40 bg-gray-50">
                  {p.images[0] ? (
                    <Image src={p.images[0]} alt={p.name} fill className="object-contain p-3" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                  )}
                  {p.badge && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{p.badge}</span>
                  )}
                  <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.stock > 0 ? `${p.stock} en stock` : 'Rupture'}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-bold text-gray-900 text-sm truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.brand} · {p.category?.name}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="font-extrabold text-gray-900">{formatPrice(p.price)}</p>
                      {p.originalPrice && <p className="text-xs text-gray-400 line-through">{formatPrice(p.originalPrice)}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)}
                        className="p-2 hover:bg-teal-50 rounded-xl transition-colors text-teal-500" title="Modifier">
                        ✏️
                      </button>
                      <button onClick={() => setDeleteConfirm(p.id)}
                        className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-500" title="Supprimer">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Supprimer ce produit ?</h3>
            <p className="text-gray-500 text-sm mb-5">Le produit sera désactivé et n'apparaîtra plus dans le catalogue.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-gray-900 text-xl">
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'name', label: 'Nom du produit', type: 'text', placeholder: 'iPhone 15 Pro' },
                  { key: 'brand', label: 'Marque', type: 'text', placeholder: 'Apple' },
                  { key: 'price', label: 'Prix (GNF)', type: 'number', placeholder: '5000000' },
                  { key: 'originalPrice', label: 'Prix barré (optionnel)', type: 'number', placeholder: '6000000' },
                  { key: 'stock', label: 'Stock', type: 'number', placeholder: '10' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder}
                      value={(form as any)[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Catégorie</label>
                  <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Badge</label>
                  <select value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                    <option value="">Aucun</option>
                    {['NOUVEAU','PROMO','POPULAIRE','GAMING','BEST_SELLER','EXCLUSIF'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Description courte</label>
                <input value={form.shortDesc} onChange={e => setForm(f => ({ ...f, shortDesc: e.target.value }))}
                  placeholder="Résumé en une phrase..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Description complète</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} placeholder="Description détaillée..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              </div>

              {/* Images */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">URLs des images</label>
                {form.images.map((img, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={img} onChange={e => updateImage(i, e.target.value)}
                      placeholder="https://..." className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    {form.images.length > 1 && (
                      <button onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                        className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm">✕</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setForm(f => ({ ...f, images: [...f.images, ''] }))}
                  className="text-teal-500 text-sm font-medium hover:text-teal-600">+ Ajouter une image</button>
              </div>

              {/* Features */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Caractéristiques</label>
                {form.features.map((feat, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={feat} onChange={e => updateFeature(i, e.target.value)}
                      placeholder="Ex: Écran 6.1 pouces..." className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                    {form.features.length > 1 && (
                      <button onClick={() => setForm(f => ({ ...f, features: f.features.filter((_, j) => j !== i) }))}
                        className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm">✕</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setForm(f => ({ ...f, features: [...f.features, ''] }))}
                  className="text-teal-500 text-sm font-medium hover:text-teal-600">+ Ajouter une caractéristique</button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-colors">
                {saving ? 'Enregistrement...' : editingProduct ? 'Mettre à jour' : 'Créer le produit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
