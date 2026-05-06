import type { Metadata } from 'next';
import CatalogueClient from './CatalogueClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://venips.com';

export const metadata: Metadata = {
  title: 'Catalogue – Téléphones, Ordinateurs & Accessoires | Venips Guinée',
  description:
    'Parcourez notre catalogue complet : téléphones, ordinateurs, tablettes, accessoires, gaming, TV et audio. Livraison partout en Guinée. Paiement Wave et Orange Money. Prix en GNF.',
  keywords: [
    'catalogue téléphone Guinée', 'acheter ordinateur Conakry', 'accessoires high-tech Guinée',
    'smartphones Conakry', 'tablettes Guinée', 'gaming Conakry', 'TV Guinée',
    'Apple iPhone Guinée', 'Samsung Galaxy Guinée', 'Huawei Guinée',
    'laptop pas cher Guinée', 'casque audio Conakry',
  ],
  alternates: { canonical: `${SITE_URL}/catalogue` },
  openGraph: {
    title: 'Catalogue Venips – Électronique en Guinée',
    description: 'Téléphones, ordinateurs, gaming et accessoires. Livraison partout en Guinée.',
    url: `${SITE_URL}/catalogue`,
  },
};

export default function CataloguePage() {
  return <CatalogueClient />;
}
