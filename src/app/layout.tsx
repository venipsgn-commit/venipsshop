import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';

export const metadata: Metadata = {
  title: 'VenipShop – Ordinateurs, Téléphones & Accessoires',
  description: 'Boutique en ligne spécialisée en ordinateurs, téléphones et accessoires high-tech. Livraison rapide, paiement sécurisé.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 min-h-screen font-sans antialiased">
        <CartProvider>
          <Navbar />
          <CartSidebar />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
