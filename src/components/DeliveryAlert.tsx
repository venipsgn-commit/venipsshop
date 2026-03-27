'use client';

import { useEffect, useRef, useState } from 'react';
import { Order, getPendingAlerts, dismissOrderAlert } from '@/lib/orders';
import { formatPrice } from '@/lib/products';

function requestBrowserNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
}

function sendBrowserNotification(order: Order) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const transiteurPart = order.transiteur ? ` — Transiteur : ${order.transiteur}` : '';
  new Notification('🚚 Livraison attendue !', {
    body: `Commande de ${order.prenom} ${order.nom}${transiteurPart}\nMontant : ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(order.total)}`,
    icon: '/favicon.ico',
    tag: order.id,          // prevents duplicate notifications for same order
    requireInteraction: true,
  });
}

export default function DeliveryAlert() {
  const [alerts, setAlerts] = useState<Order[]>([]);
  const notifiedIds = useRef<Set<string>>(new Set());

  const refresh = () => {
    const pending = getPendingAlerts();
    setAlerts(pending);

    // Fire browser notification for each new alert
    pending.forEach((order) => {
      if (!notifiedIds.current.has(order.id)) {
        notifiedIds.current.add(order.id);
        sendBrowserNotification(order);
      }
    });
  };

  useEffect(() => {
    requestBrowserNotificationPermission();
    refresh();
    const interval = setInterval(refresh, 60_000); // re-check every minute
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
          className="bg-white border-l-4 border-orange-500 rounded-xl shadow-2xl p-4"
          role="alert"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚚</span>
              <div>
                <p className="font-bold text-gray-900 text-sm leading-tight">Livraison attendue !</p>
                <p className="text-xs text-orange-600 font-medium">
                  #{order.id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={() => dismiss(order.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mt-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Details */}
          <div className="space-y-1.5 text-xs text-gray-600 bg-orange-50 rounded-lg p-3">
            <p className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium text-gray-700">Client :</span> {order.prenom} {order.nom}
            </p>
            {order.transiteur && (
              <p className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="font-medium text-gray-700">Transiteur :</span>
                <span className="text-blue-700 font-semibold">{order.transiteur}</span>
              </p>
            )}
            <p className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium text-gray-700">Prévu le :</span>{' '}
              {new Date(order.dateLivraison).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
            <p className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-gray-700">Total :</span>
              <span className="text-blue-700 font-bold">{formatPrice(order.total)}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => dismiss(order.id)}
              className="flex-1 text-xs bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition-colors"
            >
              ✓ Confirmer la réception
            </button>
            <button
              onClick={() => dismiss(order.id)}
              className="text-xs text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              Ignorer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
