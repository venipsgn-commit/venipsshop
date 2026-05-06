import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/layout/CartSidebar';
import FacebookPixel from '@/components/analytics/FacebookPixel';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://venips.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'VenipShop – Ordinateurs, Téléphones & Accessoires en Guinée',
    template: '%s | VenipShop',
  },
  description: 'Boutique en ligne spécialisée en high-tech : ordinateurs, téléphones, accessoires, gaming. Livraison partout en Guinée.',
  keywords: ['téléphone', 'ordinateur', 'accessoires', 'gaming', 'Conakry', 'Guinée', 'tech', 'Venips', 'high-tech'],
  applicationName: 'VenipShop',
  authors: [{ name: 'VenipShop' }],
  alternates: { canonical: SITE_URL },
  icons: {
    icon: '/venips-logo.png',
    apple: '/venips-logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'VenipShop',
    title: 'VenipShop – Ordinateurs, Téléphones & Accessoires en Guinée',
    description: 'Boutique en ligne spécialisée en high-tech. Livraison partout en Guinée.',
    url: SITE_URL,
    images: [{ url: '/venips-logo.png', alt: 'VenipShop' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VenipShop – High-tech en Guinée',
    description: 'Ordinateurs, téléphones, accessoires, gaming. Livraison partout en Guinée.',
    images: ['/venips-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
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
              <Navbar />
              <CartSidebar />
              <main>{children}</main>
              <Footer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
