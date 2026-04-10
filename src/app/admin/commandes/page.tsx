'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/layout/AdminLayout';
import { orderApi, type Order, type OrderStatus } from '@/lib/api';
import { formatPrice, getStatusLabel } from '@/lib/utils';

const ALL_STATUSES: OrderStatus[] = ['EN_ATTENTE', 'CONFIRME', 'EN_PREPARATION', 'EXPEDIE', 'LIVRE', 'ANNULE'];

export default function AdminCommandes() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | string>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    orderApi.all({ limit: '200' })
      .then(r => setOrders(r.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const updated = await orderApi.updateStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erreur');
    }
  };

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const q = search.toLowerCase();
    const clientName = o.user ? `${o.user.prenom} ${o.user.nom}` : '';
    const matchSearch = !q || o.orderNumber.toLowerCase().includes(q) || clientName.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-extrabold text-gray-900">
          Gestion des commandes <span className="text-gray-400 font-normal text-lg">({filtered.length})</span>
        </h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par numéro, client..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFilter('all')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-teal-500 text-white' : 'border border-gray-200 text-gray-600 hover:border-teal-300'}`}>
              Toutes
            </button>
            {ALL_STATUSES.map(s => {
              const lbl = getStatusLabel(s);
              return (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${filter === s ? 'bg-teal-500 text-white' : 'border border-gray-200 text-gray-600 hover:border-teal-300'}`}>
                  {lbl.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            Aucune commande trouvée.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => {
              const st = getStatusLabel(order.status);
              const isOpen = expanded === order.id;
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <button onClick={() => setExpanded(isOpen ? null : order.id)} className="w-full p-4 text-left">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-900 text-sm">{order.orderNumber}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-${st.color}-100 text-${st.color}-700`}>{st.label}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {order.user ? `${order.user.prenom} ${order.user.nom}` : '—'}
                          {' · '}{new Date(order.createdAt).toLocaleDateString('fr-FR')}
                          {' · '}{order.items.length} article{order.items.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-gray-900">{formatPrice(order.total)}</span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                        </svg>
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 p-5 space-y-5">
                      {/* Items */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Articles</p>
                        <div className="space-y-2">
                          {order.items.map(item => (
                            <div key={item.id} className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                                {item.image && <Image src={item.image} alt={item.name} fill className="object-contain p-1" unoptimized />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-400">× {item.quantity}</p>
                              </div>
                              <p className="text-xs font-bold">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes (address info) */}
                      {order.notes && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Livraison</p>
                          <p className="text-sm text-gray-700">{order.notes}</p>
                        </div>
                      )}

                      {/* Payment info */}
                      <div className="flex gap-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-400">Paiement</p>
                          <p className="font-semibold">{order.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Statut paiement</p>
                          <p className="font-semibold">{order.paymentStatus}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Total</p>
                          <p className="font-bold text-teal-500">{formatPrice(order.total)}</p>
                        </div>
                      </div>

                      {/* Status update */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Changer le statut</p>
                        <div className="flex flex-wrap gap-2">
                          {ALL_STATUSES.map(s => {
                            const lbl = getStatusLabel(s);
                            return (
                              <button key={s} onClick={() => updateStatus(order.id, s)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                                  order.status === s
                                    ? `bg-${lbl.color}-100 text-${lbl.color}-700 border-${lbl.color}-200`
                                    : 'border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-600'
                                }`}>
                                {order.status === s ? '✓ ' : ''}{lbl.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Mark as paid */}
                      {order.paymentStatus !== 'PAYE' && (
                        <button onClick={() => orderApi.updateStatus(order.id, undefined, 'PAYE').then(u => setOrders(prev => prev.map(o => o.id === order.id ? u : o)))}
                          className="text-sm text-green-600 font-semibold hover:text-green-700">
                          ✓ Marquer comme payée
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
