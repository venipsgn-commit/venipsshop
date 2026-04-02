import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <img src="/venips-logo.png" alt="Venips" className="h-10 w-auto" />
            </Link>
            <p className="text-sm leading-relaxed mb-4">Votre boutique tech de confiance. Produits authentiques, livraison rapide, service client premium.</p>
            <div className="flex gap-3">
              {['facebook','instagram','twitter','youtube'].map(s => (
                <a key={s} href="#" className="w-9 h-9 bg-gray-800 hover:bg-teal-500 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-sm capitalize">{s[0].toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Catégories */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Catégories</h4>
            <ul className="space-y-2 text-sm">
              {[['Téléphones','/catalogue?cat=telephones'],['Ordinateurs','/catalogue?cat=ordinateurs'],['Accessoires','/catalogue?cat=accessoires'],['Gaming','/catalogue?cat=gaming'],['TV & Audio','/catalogue?cat=tv-audio']].map(([l,h]) => (
                <li key={h}><Link href={h} className="hover:text-teal-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Compte */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Mon Compte</h4>
            <ul className="space-y-2 text-sm">
              {[['Connexion','/auth/connexion'],['Inscription','/auth/inscription'],['Mes commandes','/compte/commandes'],['Ma wishlist','/compte/wishlist'],['Mon profil','/compte/profil']].map(([l,h]) => (
                <li key={h}><Link href={h} className="hover:text-teal-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">📍</span>Dakar, Sénégal</li>
              <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">📞</span>+221 77 000 00 00</li>
              <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">📧</span>contact@venipshop.com</li>
              <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">⏰</span>Lun-Sam : 8h - 20h</li>
            </ul>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-8 border-y border-gray-800">
          {[['🚚','Livraison Rapide','24-48h sur Dakar'],['🔒','Paiement Sécurisé','Wave, OM, CB'],['↩️','Retours Faciles','30 jours gratuits'],['💬','Support 7j/7','Chat & Téléphone']].map(([icon,title,sub]) => (
            <div key={title} className="flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <div><p className="text-white font-medium text-sm">{title}</p><p className="text-xs">{sub}</p></div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 text-xs">
          <p>© 2026 VenipShop. Tous droits réservés.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-teal-400 transition-colors">Conditions générales</a>
            <a href="#" className="hover:text-teal-400 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-teal-400 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
