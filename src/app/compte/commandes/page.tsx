'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import AccountLayout from '@/components/layout/AccountLayout';
import { useAuth } from '@/context/AuthContext';
import { orderApi, type Order, type OrderStatus } from '@/lib/api';
import { formatPrice, getStatusLabel } from '@/lib/utils';

const STATUS_STEPS: OrderStatus[] = ['EN_ATTENTE', 'CONFIRME', 'EN_PREPARATION', 'EXPEDIE', 'LIVRE'];

function OrderCard({ order, onCancel }: { order: Order; onCancel: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const st = getStatusLabel(order.status);
  const stepIdx = STATUS_STEPS.indexOf(order.status as OrderStatus);
  const isCancelled = order.status === 'ANNULE';
  const canCancel = ['EN_ATTENTE', 'CONFIRME'].includes(order.status);

  const handleCancel = async () => {
    if (!confirm('Annuler cette commande ?')) return;
    setCancelling(true);
    try {
      await orderApi.cancel(order.id);
      onCancel(order.id);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full p-5 text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-gray-900">{order.orderNumber}</p>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold bg-${st.color}-100 text-${st.color}-700`}>
                {st.label}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              {' · '}{order.items.length} article{order.items.length > 1 ? 's' : ''}
              {' · '}{order.paymentMethod === 'WAVE' ? 'Wave' : order.paymentMethod === 'ORANGE_MONEY' ? 'Orange Money' : order.paymentMethod === 'CASH' ? 'Livraison' : 'Carte'}
            </p>
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
          {/* Progress */}
          {!isCancelled && (
            <div className="flex items-center justify-between relative">
              {STATUS_STEPS.map((s, i) => {
                const lbl = getStatusLabel(s);
                const done = i <= stepIdx;
                return (
                  <div key={s} className="flex flex-col items-center gap-1 flex-1 relative">
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`absolute top-3 left-1/2 w-full h-px ${i < stepIdx ? 'bg-teal-500' : 'bg-gray-200'}`} />
                    )}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors ${done ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {done && i < stepIdx ? '✓' : i + 1}
                    </div>
                    <span className="text-[10px] text-gray-500 text-center hidden sm:block">{lbl.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Items */}
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-contain p-1" unoptimized />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">× {item.quantity} · {formatPrice(item.price)}</p>
                </div>
                <p className="font-bold text-sm text-gray-900 flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="pt-4 border-t border-gray-100">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Sous-total</span><span>{formatPrice(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Réduction</span><span>-{formatPrice(order.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Livraison</span><span>{order.shippingCost === 0 ? 'Gratuite' : formatPrice(order.shippingCost)}</span></div>
              <div className="flex justify-between font-bold border-t border-gray-100 pt-1"><span>Total</span><span className="text-teal-500">{formatPrice(order.total)}</span></div>
            </div>
          </div>

          {canCancel && (
            <button onClick={handleCancel} disabled={cancelling}
              className="text-red-500 hover:text-red-600 text-sm font-semibold disabled:opacity-60">
              {cancelling ? 'Annulation...' : 'Annuler la commande'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function CommandesPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | string>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    orderApi.myOrders()
      .then(res => setOrders(res.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const handleCancel = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'ANNULE' as OrderStatus } : o));
  };

  return (
    <AccountLayout>
      <div className="space-y-5">
        <h1 className="text-xl font-extrabold text-gray-900">
          Mes commandes <span className="text-gray-400 font-normal text-base">({orders.length})</span>
        </h1>

        <div className="flex gap-2 flex-wrap">
          {[['all','Toutes'],['EN_ATTENTE','En attente'],['EXPEDIE','Expédiées'],['LIVRE','Livrées'],['ANNULE','Annulées']].map(([val,lbl]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${filter === val ? 'bg-teal-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300'}`}>
              {lbl}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-500">Aucune commande{filter !== 'all' ? ' dans cette catégorie' : ''}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(o => <OrderCard key={o.id} order={o} onCancel={handleCancel} />)}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
