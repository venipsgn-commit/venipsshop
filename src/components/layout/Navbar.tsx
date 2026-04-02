'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import VenipsLogo from '@/components/ui/VenipsLogo';

const NAV = [
  { label: 'Téléphones',    href: '/catalogue?cat=telephones',   icon: '📱' },
  { label: 'Ordinateurs',   href: '/catalogue?cat=ordinateurs',  icon: '💻' },
  { label: 'Accessoires',   href: '/catalogue?cat=accessoires',  icon: '🎧' },
  { label: 'Gaming',        href: '/catalogue?cat=gaming',       icon: '🎮' },
  { label: 'TV & Audio',    href: '/catalogue?cat=tv-audio',     icon: '📺' },
];

export default function Navbar() {
  const router = useRouter();
  const { totalItems, toggle } = useCart();
  const { user, logout } = useAuth();
  const { ids: wishIds } = useWishlist();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) { router.push(`/catalogue?q=${encodeURIComponent(search.trim())}`); setSearch(''); }
  };

  return (
    <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
      {/* Top bar */}
      <div className="border-b border-gray-800 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-8 text-xs text-gray-400">
          <span>🚚 Livraison gratuite dès 100 000 GNF</span>
          <div className="flex gap-4">
            <Link href="/catalogue" className="hover:text-cyan-400 transition-colors">Catalogue</Link>
            {user?.role === 'admin' && <Link href="/admin" className="hover:text-cyan-400 transition-colors text-cyan-400">⚙️ Admin</Link>}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3 sm:gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <VenipsLogo size={36} showText={false} className="sm:hidden" />
          <VenipsLogo size={36} showText={true} className="hidden sm:flex" />
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto sm:mx-0">
          <div className="flex bg-white rounded-xl overflow-hidden shadow-sm">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un produit, une marque..."
              className="flex-1 px-4 py-2.5 text-gray-900 text-sm focus:outline-none min-w-0"
            />
            <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 px-4 transition-colors flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Wishlist */}
          <Link href="/compte/wishlist" className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors hidden sm:flex">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {wishIds.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{wishIds.length}</span>}
          </Link>

          {/* User */}
          {user ? (
            <div ref={dropRef} className="relative">
              <button onClick={() => setDropOpen(!dropOpen)} className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user.prenom[0].toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-medium">{user.prenom}</span>
                <svg className="w-3 h-3 text-gray-400 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 text-gray-900 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b bg-cyan-50">
                    <p className="font-semibold text-sm">{user.prenom} {user.nom}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  {[
                    { href: '/compte', label: 'Tableau de bord', icon: '🏠' },
                    { href: '/compte/profil', label: 'Mon profil', icon: '👤' },
                    { href: '/compte/commandes', label: 'Mes commandes', icon: '📦' },
                    { href: '/compte/wishlist', label: 'Ma wishlist', icon: '❤️' },
                    ...(user.role === 'admin' ? [{ href: '/admin', label: 'Administration', icon: '⚙️' }] : []),
                  ].map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setDropOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-cyan-50 transition-colors text-sm">
                      <span>{item.icon}</span>{item.label}
                    </Link>
                  ))}
                  <button onClick={() => { logout(); setDropOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors text-sm border-t">
                    <span>🚪</span> Se déconnecter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/connexion" className="hidden sm:flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors text-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Connexion</span>
            </Link>
          )}

          {/* Cart */}
          <button onClick={toggle} className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-cyan-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>

          {/* Mobile menu */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Category nav */}
      <div className="hidden sm:block bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 h-10 items-center overflow-x-auto">
          {NAV.map(item => (
            <Link key={item.href} href={item.href} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors whitespace-nowrap">
              <span className="text-sm">{item.icon}</span>{item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="sm:hidden bg-gray-800 border-t border-gray-700 py-2">
          {NAV.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="border-t border-gray-700 mt-2 pt-2">
            {user ? (
              <>
                <Link href="/compte" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
                  👤 Mon compte
                </Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-400 hover:bg-gray-700 transition-colors">
                  🚪 Déconnexion
                </button>
              </>
            ) : (
              <Link href="/auth/connexion" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
                🔑 Connexion / Inscription
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
