'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatPrice } from '@/lib/storage';

interface ClientRow {
  id: string; nom: string; prenom: string; email: string;
  telephone: string; role: 'user' | 'admin'; createdAt: string;
  orderCount: number; totalSpent: number;
}

export default function AdminClients() {
  const [users, setUsers] = useState<ClientRow[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(({ users }) => setUsers(users ?? []));
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || u.nom.toLowerCase().includes(q) || u.prenom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) || u.telephone.includes(q);
  });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-extrabold text-gray-900">Clients <span className="text-gray-400 font-normal text-lg">({users.length})</span></h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, téléphone..."
            className="w-full sm:w-80 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">Aucun client trouvé.</div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-5 py-3">Client</th>
                    <th className="text-left px-5 py-3 hidden sm:table-cell">Email</th>
                    <th className="text-left px-5 py-3 hidden md:table-cell">Téléphone</th>
                    <th className="text-center px-5 py-3">Commandes</th>
                    <th className="text-right px-5 py-3">Total dépensé</th>
                    <th className="text-center px-5 py-3">Rôle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {u.prenom[0]}{u.nom[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{u.prenom} {u.nom}</p>
                            <p className="text-xs text-gray-400">Depuis {new Date(u.createdAt).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{u.email}</td>
                      <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{u.telephone}</td>
                      <td className="px-5 py-3 text-center font-semibold text-gray-900">{u.orderCount}</td>
                      <td className="px-5 py-3 text-right font-bold text-gray-900">{formatPrice(u.totalSpent)}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-600'}`}>
                          {u.role === 'admin' ? 'Admin' : 'Client'}
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
