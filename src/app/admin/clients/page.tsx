'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { userApi, type User } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function AdminClients() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    userApi.list({ limit: '100' })
      .then(r => { setUsers(r.users); setTotal(r.pagination.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q ||
      u.nom.toLowerCase().includes(q) ||
      u.prenom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.telephone || '').includes(q);
  });

  const toggleActive = async (u: User) => {
    try {
      const res = await userApi.list(); // re-fetch after toggle
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/users/${u.id}/toggle-active`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('venips_access_token')}` },
      });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: !x.isActive } : x));
    } catch {}
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-extrabold text-gray-900">
          Clients <span className="text-gray-400 font-normal text-lg">({total})</span>
        </h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, téléphone..."
            className="w-full sm:w-80 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 animate-pulse space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            Aucun client trouvé.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-5 py-3">Client</th>
                    <th className="text-left px-5 py-3 hidden sm:table-cell">Email</th>
                    <th className="text-left px-5 py-3 hidden md:table-cell">Téléphone</th>
                    <th className="text-center px-5 py-3">Statut</th>
                    <th className="text-center px-5 py-3">Rôle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((u: User) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {u.prenom[0]}{u.nom[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{u.prenom} {u.nom}</p>
                            <p className="text-xs text-gray-400">Depuis {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{u.email}</td>
                      <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{u.telephone || '—'}</td>
                      <td className="px-5 py-3 text-center">
                        <button onClick={() => toggleActive(u)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${u.isActive !== false ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                          {u.isActive !== false ? 'Actif' : 'Inactif'}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.role === 'ADMIN' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'}`}>
                          {u.role === 'ADMIN' ? 'Admin' : 'Client'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
