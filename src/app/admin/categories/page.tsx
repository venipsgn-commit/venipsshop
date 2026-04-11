'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { categoryApi, type Category } from '@/lib/api';

const ICONS = ['📱','💻','🎧','🎮','📺','🏠','⌚','📷','🖥️','⌨️','🖱️','💡','🔋','🎵','📡'];

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '📦' });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryApi.list()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', icon: '📦' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || '', icon: c.icon || '📦' });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Le nom est requis.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        const updated = await categoryApi.update(editing.id, { name: form.name, description: form.description, icon: form.icon });
        setCategories(prev => prev.map(c => c.id === editing.id ? updated : c));
      } else {
        const created = await categoryApi.create({ name: form.name, description: form.description, icon: form.icon });
        setCategories(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await categoryApi.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      setDeleteConfirm(null);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erreur lors de la suppression');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-gray-900">Catégories</h1>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm">
            <span className="text-lg">+</span> Nouvelle catégorie
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-28" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <p className="text-4xl mb-3">🗂️</p>
            <p className="text-gray-500 font-medium">Aucune catégorie pour le moment</p>
            <button onClick={openCreate} className="mt-4 text-teal-500 font-semibold text-sm hover:text-teal-600">
              Créer la première catégorie →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                <span className="text-3xl">{cat.icon || '📦'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-extrabold text-gray-900 truncate">{cat.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${cat.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {cat.description && <p className="text-xs text-gray-500 line-clamp-2 mb-2">{cat.description}</p>}
                  <p className="text-xs text-teal-500 font-semibold">{cat._count?.products ?? 0} produit{(cat._count?.products ?? 0) !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button onClick={() => openEdit(cat)}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-teal-50 hover:text-teal-600 text-gray-600 rounded-lg text-xs font-semibold transition-colors">
                    Modifier
                  </button>
                  <button onClick={() => setDeleteConfirm(cat.id)}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded-lg text-xs font-semibold transition-colors">
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal create/edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-extrabold text-gray-900 mb-5">
              {editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Téléphones, Ordinateurs..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Description de la catégorie..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Icône</label>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{form.icon}</span>
                  <input
                    type="text"
                    value={form.icon}
                    onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    placeholder="Emoji ou texte"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    maxLength={4}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(icon => (
                    <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                      className={`text-xl p-1.5 rounded-lg transition-all ${form.icon === icon ? 'bg-teal-100 ring-2 ring-teal-400' : 'hover:bg-gray-100'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold text-sm transition-colors">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white py-2.5 rounded-xl font-bold text-sm transition-colors">
                {saving ? 'Sauvegarde...' : editing ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <h3 className="font-extrabold text-gray-900 mb-2">Supprimer cette catégorie ?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Les produits associés ne seront pas supprimés mais n&apos;auront plus de catégorie.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-700 py-2.5 rounded-xl font-semibold text-sm">
                Annuler
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-bold text-sm">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
