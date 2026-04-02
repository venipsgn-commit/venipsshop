'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/layout/AdminLayout';
import { formatPrice, getStatusLabel } from '@/lib/storage';
import type { Order, OrderStatus } from '@/lib/types';

const ALL_STATUSES: OrderStatus[] = ['en_attente', 'confirme', 'en_preparation', 'expedie', 'livre', 'annule'];

export default function AdminCommandes() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/orders?all=1')
      .then(r => r.json())
      .then(({ orders }) => setOrders(orders ?? []));
  }, []);

  const updateStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const { order } = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? order : o));
    }
  }, []);

  const updateTransiteur = useCallback(async (orderId: string, transiteur: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transiteur }),
    });
  }, []);

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) ||
      `${o.address.prenom} ${o.address.nom}`.toLowerCase().includes(q) ||
      o.address.telephone.includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-extrabold text-gray-900">Gestion des commandes <span className="text-gray-400 font-normal text-lg">({filtered.length})</span></h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par ID, client, téléphone..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          <div className="flex gap-2 flex-wrap">
            {[['all','Toutes'],...ALL_STATUSES.map(s => [s, getStatusLabel(s)?.label || s])].map(([val, lbl]) => (
              <button key={val} onClick={() => setFilter(val as 'all' | OrderStatus)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${filter === val ? 'bg-cyan-500 text-white' : 'border border-gray-200 text-gray-600 hover:border-cyan-300'}`}>
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">Aucune commande trouvée.</div>
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
                          <p className="font-bold text-gray-900 text-sm">{order.id}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-${st?.color}-100 text-${st?.color}-700`}>{st?.label}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {order.address.prenom} {order.address.nom} · {order.address.telephone} · {new Date(order.createdAt).toLocaleDateString('fr-FR')}
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
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Articles</p>
                        <div className="space-y-2">
                          {order.items.map(item => (
                            <div key={item.productId} className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                                <Image src={item.productImage} alt={item.productName} fill className="object-contain p-1" unoptimized />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-900 truncate">{item.productName}</p>
                                <p className="text-xs text-gray-400">× {item.quantity}</p>
                              </div>
                              <p className="text-xs font-bold">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Livraison</p>
                        <p className="text-sm text-gray-700">{order.address.prenom} {order.address.nom}</p>
                        <p className="text-sm text-gray-500">{order.address.rue}, {order.address.ville}</p>
                        <p className="text-sm text-gray-500">{order.address.telephone}</p>
                        {order.estimatedDelivery && (
                          <p className="text-sm text-cyan-600 font-medium mt-1">Date estimée : {new Date(order.estimatedDelivery).toLocaleDateString('fr-FR')}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Transiteur (optionnel)</label>
                        <input type="text" defaultValue={order.transiteur || ''}
                          onBlur={e => updateTransiteur(order.id, e.target.value)}
                          placeholder="Nom du livreur / transporteur"
                          className="w-full sm:w-64 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Changer le statut</p>
                        <div className="flex flex-wrap gap-2">
                          {ALL_STATUSES.map(s => {
                            const lbl = getStatusLabel(s);
                            return (
                              <button key={s} onClick={() => updateStatus(order.id, s)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                                  order.status === s
                                    ? `bg-${lbl?.color}-100 text-${lbl?.color}-700 border-${lbl?.color}-200`
                                    : 'border-gray-200 text-gray-600 hover:border-cyan-300 hover:text-cyan-600'
                                }`}>
                                {order.status === s ? '✓ ' : ''}{lbl?.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
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
