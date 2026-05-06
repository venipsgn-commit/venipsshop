import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://venips.com';

export const metadata: Metadata = {
  title: 'Venips – Téléphones, Ordinateurs & Électronique en Guinée | Conakry',
  description:
    'Achetez vos téléphones, ordinateurs, accessoires et produits high-tech en ligne en Guinée. Livraison rapide à Conakry et partout en Guinée. Paiement Wave, Orange Money. Venips, votre boutique électronique de confiance.',
  keywords: [
    'téléphone Conakry', 'acheter téléphone Guinée', 'boutique électronique Guinée',
    'ordinateur Conakry', 'laptop Guinée', 'iPhone Guinée', 'Samsung Guinée',
    'achat en ligne Guinée', 'livraison Conakry', 'paiement Wave Guinée',
    'Orange Money achat', 'accessoires téléphone Conakry', 'tablette Guinée',
    'gaming Guinée', 'TV Conakry', 'Venips', 'VenipShop', 'high-tech Guinée',
    'smartphone Guinée', 'MacBook Guinée', 'Apple Guinée',
  ],
  alternates: { canonical: SITE_URL },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': ['Store', 'OnlineStore'],
  name: 'Venips',
  alternateName: 'VenipShop',
  url: SITE_URL,
  logo: `${SITE_URL}/venips-logo.png`,
  image: `${SITE_URL}/venips-logo.png`,
  description:
    'Boutique en ligne spécialisée en high-tech à Conakry, Guinée. Téléphones, ordinateurs, accessoires, gaming. Livraison partout en Guinée. Paiement Wave et Orange Money acceptés.',
  telephone: '+224628880354',
  email: 'venips.gn@gmail.com',
  priceRange: 'GNF',
  currenciesAccepted: 'GNF',
  paymentAccepted: 'Wave, Orange Money, Carte bancaire, Cash',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Conakry',
    addressLocality: 'Conakry',
    addressRegion: 'Conakry',
    addressCountry: 'GN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '9.5370',
    longitude: '-13.6773',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Guinée',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:00',
      closes: '20:00',
    },
  ],
  sameAs: [
    'https://www.facebook.com/share/18k51eTzgP/',
    'https://www.tiktok.com/@venipssarl',
    'https://wa.me/message/S24ZPJTJXYHKI1',
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <HomePageClient />
    </>
  );
}
