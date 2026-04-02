'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

const links = [
  { href: '/compte',            icon: '🏠', label: 'Tableau de bord' },
  { href: '/compte/profil',     icon: '👤', label: 'Mon profil' },
  { href: '/compte/commandes',  icon: '📦', label: 'Mes commandes' },
  { href: '/compte/wishlist',   icon: '❤️', label: 'Ma wishlist' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/connexion?redirect=' + pathname);
  }, [user, loading, pathname, router]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center mb-5 pb-5 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center text-white font-extrabold text-2xl mb-3">
                {user.prenom[0]}{user.nom[0]}
              </div>
              <p className="font-bold text-gray-900">{user.prenom} {user.nom}</p>
              <p className="text-xs text-gray-400 truncate max-w-full">{user.email}</p>
              {user.role === 'admin' && (
                <span className="mt-1.5 bg-teal-100 text-teal-600 text-xs font-bold px-2 py-0.5 rounded-full">Admin</span>
              )}
            </div>

            {/* Nav */}
            <nav className="space-y-1">
              {links.map(l => (
                <Link key={l.href} href={l.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    pathname === l.href ? 'bg-teal-50 text-teal-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <span>{l.icon}</span>{l.label}
                </Link>
              ))}
              {user.role === 'admin' && (
                <Link href="/admin"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    pathname.startsWith('/admin') ? 'bg-teal-50 text-teal-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <span>⚙️</span>Administration
                </Link>
              )}
              <button onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors w-full text-left mt-2">
                <span>🚪</span>Se déconnecter
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  );
}
