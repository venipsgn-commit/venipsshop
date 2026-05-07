'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { promoApi, type PromoCode } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

const EMPTY: Partial<PromoCode> = {
  code: '', discount: 10, minOrder: 0, maxUses: undefined, isActive: true, expiresAt: undefined,
};

export default function AdminPromos() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [form, setForm] = useState<Partial<PromoCode>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    promoApi.list()
      .then(setPromos)
      .catch(() => setError('Impossible de charger les codes promo'))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true); setError(''); };
  const openEdit = (p: PromoCode) => {
    setEditing(p);
    setForm({
      code: p.code, discount: p.discount, minOrder: p.minOrder,
      maxUses: p.maxUses, isActive: p.isActive,
      expiresAt: p.expiresAt ? p.expiresAt.slice(0, 10) : undefined,
    });
    setShowForm(true);
    setError('');
  };

  const handleSave = async () => {
    if (!form.code?.trim()) { setError('Le code est obligatoire'); return; }
    if (!form.discount || form.discount < 1 || form.discount > 100) { setError('La réduction doit être entre 1 et 100%'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase().trim(),
        discount: Number(form.discount),
        minOrder: Number(form.minOrder ?? 0),
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };
      if (editing) {
        const updated = await promoApi.update(editing.id, payload);
        setPromos(prev => prev.map(p => p.id === editing.id ? updated : p));
      } else {
        const created = await promoApi.create(payload);
        setPromos(prev => [created, ...prev]);
      }
      setShowForm(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (p: PromoCode) => {
    try {
      const updated = await promoApi.update(p.id, { isActive: !p.isActive });
      setPromos(prev => prev.map(x => x.id === p.id ? updated : x));
    } catch {
      alert('Erreur');
    }
  };

  const handleDelete = async (p: PromoCode) => {
    if (!confirm(`Supprimer le code "${p.code}" ?`)) return;
    try {
      await promoApi.delete(p.id);
      setPromos(prev => prev.filter(x => x.id !== p.id));
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Codes promo <span className="text-gray-400 font-normal text-lg">({promos.length})</span>
          </h1>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors">
            ➕ Nouveau code
          </button>
        </div>

        {error && !showForm && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
        )}

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-gray-900">
                  {editing ? 'Modifier le code' : 'Nouveau code promo'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-sm">{error}</div>}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Code promo *</label>
                  <input
                    value={form.code ?? ''}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="EX: PROMO20"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Réduction (%) *</label>
                    <input
                      type="number" min={1} max={100}
                      value={form.discount ?? ''}
                      onChange={e => setForm(f => ({ ...f, discount: Number(e.target.value) }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Commande min. (GNF)</label>
                    <input
                      type="number" min={0}
                      value={form.minOrder ?? 0}
                      onChange={e => setForm(f => ({ ...f, minOrder: Number(e.target.value) }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Utilisations max.</label>
                    <input
                      type="number" min={1}
                      value={form.maxUses ?? ''}
                      onChange={e => setForm(f => ({ ...f, maxUses: e.target.value ? Number(e.target.value) : undefined }))}
                      placeholder="Illimité"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Expire le</label>
                    <input
                      type="date"
                      value={form.expiresAt ?? ''}
                      onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value || undefined }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-teal-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isActive ? 'left-6' : 'left-1'}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Code actif</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors">
                  {saving ? 'Sauvegarde...' : editing ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
          </div>
        ) : promos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center">
            <div className="text-5xl mb-3">🎟️</div>
            <h3 className="font-bold text-gray-900 mb-1">Aucun code promo</h3>
            <p className="text-sm text-gray-400 mb-5">Créez votre premier code promo pour attirer des clients</p>
            <button onClick={openCreate} className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
              Créer un code
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {promos.map(p => {
              const expired = p.expiresAt ? new Date(p.expiresAt) < new Date() : false;
              const exhausted = p.maxUses != null && p.currentUses >= p.maxUses;
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-extrabold text-lg text-gray-900 bg-gray-100 px-3 py-1 rounded-lg tracking-wider">
                        {p.code}
                      </span>
                      <span className="bg-teal-100 text-teal-700 font-bold text-sm px-2.5 py-1 rounded-full">
                        -{p.discount}%
                      </span>
                      {!p.isActive && (
                        <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full">Inactif</span>
                      )}
                      {expired && (
                        <span className="bg-red-100 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full">Expiré</span>
                      )}
                      {exhausted && (
                        <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full">Épuisé</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggle(p)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${p.isActive ? 'border-orange-200 text-orange-600 hover:bg-orange-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                        {p.isActive ? 'Désactiver' : 'Activer'}
                      </button>
                      <button onClick={() => openEdit(p)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                        ✏️ Modifier
                      </button>
                      <button onClick={() => handleDelete(p)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                    <span>Commande min. : <strong className="text-gray-700">{p.minOrder > 0 ? formatPrice(p.minOrder) : 'Aucune'}</strong></span>
                    <span>Utilisations : <strong className="text-gray-700">{p.currentUses}{p.maxUses ? ` / ${p.maxUses}` : ' (illimité)'}</strong></span>
                    {p.expiresAt && (
                      <span>Expire le : <strong className={expired ? 'text-red-600' : 'text-gray-700'}>{new Date(p.expiresAt).toLocaleDateString('fr-FR')}</strong></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
