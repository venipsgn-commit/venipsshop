'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import AccountLayout from '@/components/layout/AccountLayout';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, getStatusLabel } from '@/lib/storage';
import type { Order, OrderStatus } from '@/lib/types';

const STATUS_STEPS: OrderStatus[] = ['en_attente', 'confirme', 'en_preparation', 'expedie', 'livre'];

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const st = getStatusLabel(order.status);
  const stepIdx = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'annule';
  const estimatedDate = new Date(order.estimatedDelivery);
  const daysLeft = Math.ceil((estimatedDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full p-5 text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-gray-900">{order.id}</p>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold bg-${st?.color}-100 text-${st?.color}-700`}>{st?.label}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              {' · '}{order.items.length} article{order.items.length > 1 ? 's' : ''}
              {' · '}{order.paymentMethod === 'wave' ? 'Wave' : order.paymentMethod === 'orange_money' ? 'Orange Money' : 'Carte'}
            </p>
            {order.transiteur && <p className="text-xs text-gray-500 mt-1">Transiteur : <span className="font-semibold text-gray-700">{order.transiteur}</span></p>}
            {order.status === 'expedie' && daysLeft >= 0 && (
              <p className="text-xs text-orange-600 font-semibold mt-1">🚚 Livraison estimée : {estimatedDate.toLocaleDateString('fr-FR')} ({daysLeft > 0 ? `dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}` : 'aujourd\'hui'})</p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <p className="font-extrabold text-gray-900">{formatPrice(order.total)}</p>
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 p-5 space-y-5">
          {!isCancelled && (
            <div className="flex items-center justify-between mb-2">
              {STATUS_STEPS.map((s, i) => {
                const lbl = getStatusLabel(s);
                const done = i <= stepIdx;
                return (
                  <div key={s} className="flex flex-col items-center gap-1 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${done ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {done && i < stepIdx ? '✓' : i + 1}
                    </div>
                    <span className="text-[10px] text-gray-500 text-center hidden sm:block">{lbl?.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                  <Image src={item.productImage} alt={item.productName} fill className="object-contain p-1" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.productName}</p>
                  <p className="text-xs text-gray-400">× {item.quantity} · {formatPrice(item.price)}</p>
                </div>
                <p className="font-bold text-sm text-gray-900 flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Adresse de livraison</p>
              <p className="text-sm text-gray-700">{order.address.prenom} {order.address.nom}</p>
              <p className="text-sm text-gray-500">{order.address.rue}</p>
              <p className="text-sm text-gray-500">{order.address.ville}, {order.address.pays}</p>
              <p className="text-sm text-gray-500">{order.address.telephone}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Récapitulatif</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Sous-total</span><span>{formatPrice(order.subtotal)}</span></div>
                {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Réduction</span><span>-{formatPrice(order.discount)}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">Livraison</span><span>{order.shippingCost === 0 ? 'Gratuite' : formatPrice(order.shippingCost)}</span></div>
                <div className="flex justify-between font-bold border-t border-gray-100 pt-1"><span>Total</span><span className="text-orange-500">{formatPrice(order.total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommandesPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');

  useEffect(() => {
    if (!user) return;
    fetch('/api/orders').then(r => r.json()).then(({ orders }) => setOrders(orders ?? []));
  }, [user]);

  if (!user) return null;

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <AccountLayout>
      <div className="space-y-5">
        <h1 className="text-xl font-extrabold text-gray-900">Mes commandes <span className="text-gray-400 font-normal text-base">({orders.length})</span></h1>

        <div className="flex gap-2 flex-wrap">
          {[['all','Toutes'],['en_attente','En attente'],['expedie','Expédiées'],['livre','Livrées'],['annule','Annulées']].map(([val,lbl]) => (
            <button key={val} onClick={() => setFilter(val as 'all' | OrderStatus)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${filter === val ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'}`}>
              {lbl}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-500">Aucune commande{filter !== 'all' ? ' dans cette catégorie' : ''}</p>
          </div>
        ) : (
          <div className="space-y-4">{filtered.map(o => <OrderCard key={o.id} order={o} />)}</div>
        )}
      </div>
    </AccountLayout>
  );
}
