import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/layout/CartSidebar';
import FacebookPixel from '@/components/analytics/FacebookPixel';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import PromoBanner from '@/components/ui/PromoBanner';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://venips.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Venips – Téléphones, Ordinateurs & Électronique en Guinée | Conakry',
    template: '%s | Venips Guinée',
  },
  description: 'Boutique en ligne high-tech à Conakry : téléphones, ordinateurs, accessoires, gaming. Livraison partout en Guinée. Paiement Wave, Orange Money, carte bancaire.',
  keywords: [
    'téléphone Conakry', 'ordinateur Guinée', 'boutique électronique Guinée',
    'achat en ligne Guinée', 'livraison Conakry', 'iPhone Guinée', 'Samsung Guinée',
    'paiement Wave Guinée', 'Orange Money achat', 'high-tech Guinée', 'Venips',
    'smartphone pas cher Guinée', 'accessoires téléphone Conakry', 'gaming Guinée',
  ],
  applicationName: 'Venips',
  authors: [{ name: 'Venips', url: SITE_URL }],
  alternates: { canonical: SITE_URL },
  icons: {
    icon: '/venips-logo.png',
    apple: '/venips-logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_GN',
    siteName: 'Venips',
    title: 'Venips – Électronique en Guinée | Conakry',
    description: 'Téléphones, ordinateurs, accessoires high-tech. Livraison partout en Guinée. Paiement Wave & Orange Money.',
    url: SITE_URL,
    images: [{ url: '/venips-logo.png', alt: 'Venips – Boutique électronique Guinée' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Venips – High-tech en Guinée',
    description: 'Téléphones, ordinateurs, gaming. Livraison partout en Guinée. Paiement Wave & Orange Money.',
    images: ['/venips-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  other: {
    'geo.region': 'GN-C',
    'geo.placename': 'Conakry, Guinée',
    'geo.position': '9.5370;-13.6773',
    'ICBM': '9.5370, -13.6773',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-white min-h-screen font-sans antialiased">
        <FacebookPixel />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <PromoBanner />
              <Navbar />
              <CartSidebar />
              <main className="pt-14 sm:pt-[96px]">{children}</main>
              <Footer />
              <WhatsAppButton />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
