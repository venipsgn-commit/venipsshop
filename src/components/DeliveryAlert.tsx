'use client';

import { useEffect, useState } from 'react';
import { Order, getPendingAlerts, dismissOrderAlert } from '@/lib/orders';
import { formatPrice } from '@/lib/products';

export default function DeliveryAlert() {
  const [alerts, setAlerts] = useState<Order[]>([]);

  const refresh = () => {
    setAlerts(getPendingAlerts());
  };

  useEffect(() => {
    refresh();
    // Re-check every minute
    const interval = setInterval(refresh, 60_000);
    return () => clearInterval(interval);
  }, []);

  const dismiss = (orderId: string) => {
    dismissOrderAlert(orderId);
    setAlerts((prev) => prev.filter((a) => a.id !== orderId));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-3 max-w-sm w-full">
      {alerts.map((order) => (
        <div
          key={order.id}
          className="bg-white border-l-4 border-orange-500 rounded-xl shadow-2xl p-4 animate-pulse-once"
          role="alert"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚚</span>
              <div>
                <p className="font-bold text-gray-900 text-sm">Livraison attendue !</p>
                <p className="text-xs text-orange-600 font-medium">
                  Commande #{order.id.slice(-6).toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={() => dismiss(order.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-1 text-xs text-gray-600">
            <p className="flex items-center gap-1.5">
              <span className="font-medium text-gray-700">Transiteur :</span>
              <span className="text-blue-600 font-semibold">{order.transiteur}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <span className="font-medium text-gray-700">Client :</span>
              {order.prenom} {order.nom}
            </p>
            <p className="flex items-center gap-1.5">
              <span className="font-medium text-gray-700">Date prévue :</span>
              {new Date(order.dateLivraison).toLocaleString('fr-FR', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
            <p className="flex items-center gap-1.5">
              <span className="font-medium text-gray-700">Montant :</span>
              <span className="text-blue-600 font-bold">{formatPrice(order.total)}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => dismiss(order.id)}
              className="flex-1 text-xs bg-orange-500 hover:bg-orange-600 text-white py-1.5 rounded-lg font-semibold transition-colors"
            >
              Confirmer la réception
            </button>
            <button
              onClick={() => dismiss(order.id)}
              className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              Ignorer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
