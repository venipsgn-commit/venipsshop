'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrders, Order } from '@/lib/orders';
import { formatPrice } from '@/lib/products';

function StatusBadge({ statut }: { statut: Order['statut'] }) {
  const map = {
    en_attente: { label: 'En attente', cls: 'bg-yellow-100 text-yellow-700' },
    en_transit: { label: 'En transit', cls: 'bg-blue-100 text-blue-700' },
    livree: { label: 'Livrée', cls: 'bg-emerald-100 text-emerald-700' },
  };
  const s = map[statut];
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>;
}

function DeliveryCountdown({ dateLivraison }: { dateLivraison: string }) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const target = new Date(dateLivraison);
      const diffMs = target.getTime() - now.getTime();

      if (diffMs <= 0) {
        setLabel('Arrivée attendue maintenant');
        return;
      }

      const diffH = Math.floor(diffMs / 3_600_000);
      const diffM = Math.floor((diffMs % 3_600_000) / 60_000);
      const diffD = Math.floor(diffH / 24);

      if (diffD > 0) setLabel(`Dans ${diffD}j ${diffH % 24}h`);
      else if (diffH > 0) setLabel(`Dans ${diffH}h ${diffM}min`);
      else setLabel(`Dans ${diffM} min`);
    };

    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [dateLivraison]);

  const isPast = new Date(dateLivraison) <= new Date();

  return (
    <span className={`text-xs font-medium ${isPast ? 'text-orange-600' : 'text-gray-500'}`}>
      {isPast ? '⚠️ ' : '🕐 '}{label}
    </span>
  );
}

export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const all = getOrders();
    // Most recent first
    setOrders([...all].reverse());
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600 transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Mes commandes</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes commandes en cours</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} commande{orders.length !== 1 ? 's' : ''} enregistrée{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/commande" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          + Nouvelle commande
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune commande</h2>
          <p className="text-gray-500 mb-6">Vous n&apos;avez pas encore passé de commande.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-block">
            Parcourir la boutique
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isDeliveryDue = new Date(order.dateLivraison) <= new Date() && order.statut !== 'livree';
            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-colors ${
                  isDeliveryDue ? 'border-orange-300 ring-1 ring-orange-200' : 'border-gray-100'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <StatusBadge statut={order.statut} />
                    {isDeliveryDue && (
                      <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded-full animate-pulse">
                        🚚 Livraison attendue !
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    Commandé le {new Date(order.createdAt).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
                  </span>
                </div>

                {/* Body */}
                <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Client */}
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Client</p>
                    <p className="font-semibold text-gray-900">{order.prenom} {order.nom}</p>
                    <p className="text-xs text-gray-500">{order.telephone}</p>
                    <p className="text-xs text-gray-500">{order.ville}, {order.pays}</p>
                  </div>

                  {/* Transiteur & Livraison */}
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Transiteur & Livraison</p>
                    {order.transiteur ? (
                      <p className="font-semibold text-blue-700 flex items-center gap-1.5">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {order.transiteur}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Transiteur non renseigné</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      📅 {new Date(order.dateLivraison).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    <DeliveryCountdown dateLivraison={order.dateLivraison} />
                  </div>

                  {/* Total & Paiement */}
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Total & Paiement</p>
                    <p className="text-xl font-bold text-blue-600">{formatPrice(order.total)}</p>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">{order.paiement.replace('-', ' ')}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {order.items.length} article{order.items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="px-6 pb-4">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Articles</p>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item) => (
                      <span key={item.productId} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">
                        {item.productName} × {item.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
