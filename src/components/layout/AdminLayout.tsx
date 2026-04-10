'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

const links = [
  { href: '/admin',           icon: '📊', label: 'Tableau de bord' },
  { href: '/admin/produits',  icon: '🛍️', label: 'Produits' },
  { href: '/admin/commandes', icon: '📦', label: 'Commandes' },
  { href: '/admin/clients',   icon: '👥', label: 'Clients' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/');
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin header */}
      <header className="bg-gray-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/"><img src="/venips-logo.png" alt="Venips" className="h-8 w-auto" /></Link>
          <span className="text-gray-600">/</span>
          <span className="text-gray-300 text-sm font-semibold">Administration</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:block">{user.prenom} {user.nom}</span>
          <Link href="/compte" className="text-xs text-gray-400 hover:text-white transition-colors">Mon compte →</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 space-y-1">
              {links.map(l => (
                <Link key={l.href} href={l.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    pathname === l.href || (l.href !== '/admin' && pathname.startsWith(l.href))
                      ? 'bg-teal-50 text-teal-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  <span>{l.icon}</span>{l.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <div className="lg:col-span-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
