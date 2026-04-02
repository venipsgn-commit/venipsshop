'use client';
import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { products as defaultProducts } from '@/lib/data/products';
import { getAdminProducts, saveAdminProducts, formatPrice } from '@/lib/storage';
import type { Product, Category } from '@/lib/types';

function getProducts(): Product[] {
  const admin = getAdminProducts();
  return admin || defaultProducts;
}

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'telephones', label: 'Téléphones' },
  { value: 'ordinateurs', label: 'Ordinateurs' },
  { value: 'accessoires', label: 'Accessoires' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'tv-audio', label: 'TV & Audio' },
  { value: 'smart-home', label: 'Smart Home' },
];

const EMPTY_PRODUCT: Omit<Product, 'id'> = {
  name: '', brand: '', category: 'telephones', subcategory: '',
  price: 0, originalPrice: undefined, description: '', shortDesc: '',
  features: [], specs: {}, images: [''], stock: 0,
  rating: 5, reviewCount: 0, reviews: [],
  badge: undefined, isNew: false, isFeatured: false,
};

export default function AdminProduits() {
  const [allProducts, setAllProducts] = useState<Product[]>(() => getProducts());
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<'all' | Category>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(EMPTY_PRODUCT);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = allProducts.filter(p => {
    const matchCat = catFilter === 'all' || p.category === catFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const saveProducts = useCallback((updated: Product[]) => {
    saveAdminProducts(updated);
    setAllProducts(updated);
  }, []);

  const openAdd = () => {
    setEditingProduct(null);
    setForm(EMPTY_PRODUCT);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({ ...p });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.brand.trim()) return;
    if (editingProduct) {
      saveProducts(allProducts.map(p => p.id === editingProduct.id ? { ...form, id: editingProduct.id } : p));
    } else {
      const newP: Product = { ...form, id: `prod_${Date.now()}` };
      saveProducts([newP, ...allProducts]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    saveProducts(allProducts.filter(p => p.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-extrabold text-gray-900">Produits <span className="text-gray-400 font-normal text-lg">({allProducts.length})</span></h1>
          <button onClick={openAdd} className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
            <span className="text-lg">+</span> Ajouter un produit
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setCatFilter('all')} className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${catFilter === 'all' ? 'bg-teal-500 text-white' : 'border border-gray-200 text-gray-600'}`}>Toutes</button>
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => setCatFilter(c.value)} className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${catFilter === c.value ? 'bg-teal-500 text-white' : 'border border-gray-200 text-gray-600 hover:border-teal-300'}`}>{c.label}</button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative h-36 bg-gray-50">
                <Image src={p.images[0]} alt={p.name} fill className="object-contain p-3" unoptimized />
                {p.badge && <span className="absolute top-2 left-2 bg-teal-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{p.badge}</span>}
                <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${p.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`} title={p.stock > 0 ? 'En stock' : 'Rupture'} />
              </div>
              <div className="p-4">
                <p className="text-xs text-teal-500 font-semibold mb-0.5">{p.brand} · {CATEGORIES.find(c => c.value === p.category)?.label}</p>
                <p className="font-bold text-gray-900 text-sm line-clamp-2 mb-2">{p.name}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-gray-900">{formatPrice(p.price)}</p>
                    <p className="text-xs text-gray-400">Stock : {p.stock}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-xl border border-gray-200 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center text-gray-400 transition-all text-sm">✏️</button>
                    <button onClick={() => setDeleteConfirm(p.id)} className="w-8 h-8 rounded-xl border border-gray-200 hover:border-red-400 hover:text-red-500 flex items-center justify-center text-gray-400 transition-all text-sm">🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delete confirm */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="font-extrabold text-gray-900 text-lg mb-2">Supprimer ce produit ?</h3>
              <p className="text-gray-500 text-sm mb-5">Cette action est irréversible.</p>
              <div className="flex gap-3">
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-bold text-sm transition-colors">Supprimer</button>
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">Annuler</button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl my-4">
              <h3 className="font-extrabold text-gray-900 text-lg mb-5">
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </h3>
              <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
                {/* Basic fields */}
                {[
                  { key: 'name', label: 'Nom du produit *', type: 'text', placeholder: 'iPhone 16 Pro' },
                  { key: 'brand', label: 'Marque *', type: 'text', placeholder: 'Apple' },
                  { key: 'subcategory', label: 'Sous-catégorie', type: 'text', placeholder: 'Smartphones' },
                  { key: 'shortDesc', label: 'Description courte', type: 'text', placeholder: 'Résumé en 1 ligne' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">{f.label}</label>
                    <input type={f.type} value={(form as unknown as Record<string, string>)[f.key] || ''}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3} placeholder="Description complète du produit"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Prix (GNF) *</label>
                    <input type="number" value={form.price || ''} onChange={e => setForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                      placeholder="150000"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Prix original</label>
                    <input type="number" value={form.originalPrice || ''} onChange={e => setForm(prev => ({ ...prev, originalPrice: e.target.value ? Number(e.target.value) : undefined }))}
                      placeholder="200000"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Stock *</label>
                    <input type="number" value={form.stock || ''} onChange={e => setForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                      placeholder="50"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Catégorie</label>
                    <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value as Category }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">URL de l&apos;image</label>
                  <input type="url" value={form.images[0] || ''} onChange={e => setForm(prev => ({ ...prev, images: [e.target.value] }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Badge</label>
                    <select value={form.badge || ''} onChange={e => setForm(prev => ({ ...prev, badge: (e.target.value || undefined) as Product['badge'] }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                      <option value="">Aucun</option>
                      {['Nouveau','Promo','Populaire','Gaming','Best Seller','Exclusif'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end pb-2.5 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isFeatured || false} onChange={e => setForm(prev => ({ ...prev, isFeatured: e.target.checked }))} className="accent-teal-500" />
                      <span className="text-xs font-semibold text-gray-700">Produit vedette</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
                <button onClick={handleSave} className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-bold text-sm transition-colors">
                  {editingProduct ? 'Enregistrer' : 'Ajouter le produit'}
                </button>
                <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
