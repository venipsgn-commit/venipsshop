import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://venips.com';

export const metadata: Metadata = {
  title: 'À propos de Venips – Boutique high-tech à Conakry, Guinée',
  description: 'Venips est votre boutique en ligne spécialisée en high-tech à Conakry. Téléphones, ordinateurs, accessoires. Livraison partout en Guinée. Paiement à la livraison.',
  alternates: { canonical: `${SITE_URL}/a-propos` },
  openGraph: {
    title: 'À propos de Venips',
    description: 'Votre boutique high-tech de confiance à Conakry, Guinée.',
    url: `${SITE_URL}/a-propos`,
  },
};

const TEAM = [
  { initial: 'V', name: 'Venips Team', role: 'Service client & livraison', color: 'bg-teal-500' },
];

const VALUES = [
  { icon: '✅', title: 'Authenticité', desc: 'Tous nos produits sont 100% authentiques, achetés auprès de distributeurs officiels.' },
  { icon: '🚚', title: 'Livraison rapide', desc: 'Livraison partout en Guinée. À Conakry sous 24h, en régions sous 48-72h.' },
  { icon: '💵', title: 'Paiement à la livraison', desc: 'Tu paies uniquement quand tu reçois et vérifies ton colis. Zéro risque.' },
  { icon: '🛡️', title: 'Garantie', desc: 'Garantie constructeur sur tous les produits. Retours acceptés sous 30 jours.' },
  { icon: '📞', title: 'Support réactif', desc: 'Notre équipe répond sur WhatsApp du lundi au samedi, de 8h à 20h.' },
  { icon: '💰', title: 'Meilleurs prix', desc: 'On s\'engage à offrir les prix les plus compétitifs du marché guinéen.' },
];

export default function AProposPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Hero */}
      <div className="text-center mb-14">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
          À propos de <span className="text-teal-500">Venips</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Votre boutique en ligne high-tech de confiance à Conakry, Guinée.
          Téléphones, ordinateurs, accessoires et gaming — livrés partout en Guinée.
        </p>
      </div>

      {/* Notre histoire */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-3xl p-8 sm:p-12 text-white mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">Notre histoire</h2>
        <p className="text-teal-100 leading-relaxed text-base sm:text-lg mb-4">
          Venips est née d'un constat simple : trouver des produits high-tech de qualité et authentiques en Guinée était difficile, risqué, et souvent trop coûteux. Nous avons décidé de changer ça.
        </p>
        <p className="text-teal-100 leading-relaxed text-base sm:text-lg">
          Basés à Conakry, nous sélectionnons rigoureusement chaque produit, travaillons directement avec les distributeurs officiels, et livrons partout en Guinée. Notre priorité : votre satisfaction et votre confiance.
        </p>
      </div>

      {/* Nos valeurs */}
      <div className="mb-12">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">Ce qui nous définit</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {VALUES.map(v => (
            <div key={v.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{v.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chiffres */}
      <div className="bg-gray-50 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">Venips en chiffres</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: '500+', label: 'Clients satisfaits' },
            { value: '100+', label: 'Produits disponibles' },
            { value: '24h', label: 'Livraison Conakry' },
            { value: '30j', label: 'Garantie retour' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-teal-500 mb-1">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 mb-12">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Nous contacter</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="font-semibold text-gray-900">Adresse</p>
                <p className="text-gray-500 text-sm">Conakry, Guinée</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📞</span>
              <div>
                <p className="font-semibold text-gray-900">Téléphone / WhatsApp</p>
                <a href="tel:+224628880354" className="text-teal-500 text-sm font-medium hover:underline">+224 628 880 354</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📧</span>
              <div>
                <p className="font-semibold text-gray-900">Email</p>
                <a href="mailto:venips.gn@gmail.com" className="text-teal-500 text-sm font-medium hover:underline">venips.gn@gmail.com</a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🕐</span>
              <div>
                <p className="font-semibold text-gray-900">Horaires</p>
                <p className="text-gray-500 text-sm">Lun – Sam : 8h00 – 20h00</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href="https://wa.me/224628880354?text=Bonjour%20Venips%20!"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-2xl font-bold transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Discuter sur WhatsApp
            </a>
            <a
              href="https://www.facebook.com/share/18k51eTzgP/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-bold transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current flex-shrink-0">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Suivre sur Facebook
            </a>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Prêt à commander ?</h2>
        <p className="text-gray-500 mb-6">Découvrez notre catalogue et trouvez le produit qui vous convient.</p>
        <Link href="/catalogue"
          className="inline-block text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg active:scale-95"
          style={{ background: 'linear-gradient(135deg, #22c55e, #15803d)', boxShadow: '0 8px 24px rgba(34,197,94,0.35)' }}>
          Explorer le catalogue
        </Link>
      </div>
    </div>
  );
}
