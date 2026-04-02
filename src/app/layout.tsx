import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/layout/CartSidebar';

export const metadata: Metadata = {
  title: 'VenipShop – Ordinateurs, Téléphones & Accessoires',
  description: 'Boutique en ligne spécialisée en high-tech : ordinateurs, téléphones, accessoires, gaming. Livraison rapide en Guinée Conakry.',
  keywords: 'téléphone, ordinateur, accessoires, gaming, Conakry, Guinée, tech',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 min-h-screen font-sans antialiased">
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
