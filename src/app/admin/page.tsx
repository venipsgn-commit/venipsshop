'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { orderApi, userApi, productApi, type Order } from '@/lib/api';
import { formatPrice, getStatusLabel } from '@/lib/utils';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      orderApi.all({ limit: '100' }).then(r => setOrders(r.orders)),
      userApi.list().then(r => setUserCount(r.pagination.total)),
      productApi.list({ limit: '1' }).then(r => setProductCount(r.pagination.total)),
    ]).finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.filter(o => o.status === 'LIVRE').reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'EN_ATTENTE').length;
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length;
  const recentOrders = orders.slice(0, 5);

  const stats = [
    { icon: '💰', label: 'Revenus totaux', value: formatPrice(totalRevenue), color: 'text-green-600', bg: 'bg-green-50' },
    { icon: '📦', label: 'Total commandes', value: orders.length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: '⏳', label: 'En attente', value: pendingOrders, color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: '👥', label: 'Clients', value: userCount, color: 'text-violet-600', bg: 'bg-violet-50' },
    { icon: '🛍️', label: 'Produits', value: productCount, color: 'text-gray-700', bg: 'bg-gray-50' },
    { icon: '📅', label: "Commandes aujourd'hui", value: todayOrders, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Tableau de bord</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {stats.map(s => (
            <div key={s.label} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 ${loading ? 'animate-pulse' : ''}`}>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
              <p className={`text-xl font-extrabold ${s.color}`}>{loading ? '—' : s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/admin/produits', icon: '➕', label: 'Ajouter un produit' },
            { href: '/admin/commandes', icon: '📋', label: 'Gérer les commandes' },
            { href: '/admin/clients', icon: '👥', label: 'Voir les clients' },
            { href: '/catalogue', icon: '🛍️', label: 'Voir la boutique' },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center text-center gap-2 hover:border-teal-200 hover:bg-teal-50 transition-all group">
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-teal-600">{a.label}</span>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-extrabold text-gray-900">Dernières commandes</h2>
            <Link href="/admin/commandes" className="text-xs text-teal-500 font-semibold hover:text-teal-600">Voir tout →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-center text-gray-400 py-10 text-sm">{loading ? 'Chargement...' : 'Aucune commande pour le moment.'}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-5 py-3">Commande</th>
                    <th className="text-left px-5 py-3 hidden sm:table-cell">Client</th>
                    <th className="text-left px-5 py-3 hidden sm:table-cell">Date</th>
                    <th className="text-left px-5 py-3">Statut</th>
                    <th className="text-right px-5 py-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map(o => {
                    const st = getStatusLabel(o.status);
                    return (
                      <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 font-semibold text-gray-900">{o.orderNumber}</td>
                        <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">
                          {o.user ? `${o.user.prenom} ${o.user.nom}` : '—'}
                        </td>
                        <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">
                          {new Date(o.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold bg-${st.color}-100 text-${st.color}-700`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-gray-900">{formatPrice(o.total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
