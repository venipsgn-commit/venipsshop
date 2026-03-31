'use client';
import Link from 'next/link';
import AccountLayout from '@/components/layout/AccountLayout';
import { useAuth } from '@/context/AuthContext';
import { getUserOrders, formatPrice, getStatusLabel } from '@/lib/storage';

export default function CompteHome() {
  const { user } = useAuth();
  if (!user) return null;

  const orders = getUserOrders(user.id);
  const recent = orders.slice(-3).reverse();
  const totalSpent = orders.filter(o => o.status === 'livre').reduce((s, o) => s + o.total, 0);

  return (
    <AccountLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-extrabold mb-1">Bonjour, {user.prenom} ! 👋</h1>
          <p className="text-orange-100 text-sm">Bienvenue sur votre espace personnel VenipShop.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { icon: '📦', label: 'Commandes', value: orders.length },
            { icon: '❤️', label: 'Wishlist', value: user.wishlist.length },
            { icon: '💰', label: 'Total dépensé', value: formatPrice(totalSpent) },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <span className="text-2xl">{s.icon}</span>
              <p className="text-xl font-extrabold text-gray-900 mt-1">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/compte/profil', icon: '👤', label: 'Modifier profil' },
            { href: '/compte/commandes', icon: '📦', label: 'Mes commandes' },
            { href: '/compte/wishlist', icon: '❤️', label: 'Ma wishlist' },
            { href: '/catalogue', icon: '🛍️', label: 'Continuer achats' },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center text-center gap-2 hover:border-orange-200 hover:bg-orange-50 transition-all group">
              <span className="text-2xl">{l.icon}</span>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-orange-600">{l.label}</span>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        {recent.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-gray-900">Commandes récentes</h2>
              <Link href="/compte/commandes" className="text-xs text-orange-500 font-semibold hover:text-orange-600">Voir tout →</Link>
            </div>
            <div className="space-y-3">
              {recent.map(order => {
                const st = getStatusLabel(order.status);
                return (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{order.id}</p>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('fr-FR')} · {order.items.length} article{order.items.length > 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold bg-${st?.color}-100 text-${st?.color}-700`}>
                        {st?.label}
                      </span>
                      <span className="font-bold text-gray-900 text-sm">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
