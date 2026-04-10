'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatPrice, formatPriceShort } from '@/lib/utils';

const FREE_DELIVERY = 100_000;

export default function CartPage() {
  const { items, totalPrice, setQty, removeItem, clearCart } = useCart();

  const shippingCost = totalPrice >= FREE_DELIVERY ? 0 : 3500;
  const grandTotal = totalPrice + shippingCost;
  const remaining = FREE_DELIVERY - totalPrice;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Votre panier est vide</h1>
        <p className="text-gray-500 mb-8 max-w-sm">Vous n&apos;avez pas encore ajouté de produit à votre panier.</p>
        <Link href="/catalogue" className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-teal-500/25">
          Découvrir nos produits
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">
        Mon Panier <span className="text-gray-400 font-normal text-xl">({items.length} article{items.length > 1 ? 's' : ''})</span>
      </h1>

      {/* Free shipping progress */}
      {totalPrice < FREE_DELIVERY && (
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-teal-800 font-medium">🚚 Livraison gratuite</span>
            <span className="text-sm font-bold text-teal-600">{formatPriceShort(remaining)} restants</span>
          </div>
          <div className="h-2 bg-teal-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${Math.min(100, (totalPrice / FREE_DELIVERY) * 100)}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4">
              <Link href={`/produit/${product.id}`} className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                <Image src={product.images[0]} alt={product.name} fill className="object-contain p-1" unoptimized />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-teal-500 font-semibold uppercase">{product.brand}</p>
                    <Link href={`/produit/${product.id}`} className="text-sm sm:text-base font-semibold text-gray-900 hover:text-teal-500 line-clamp-2">{product.name}</Link>
                  </div>
                  <button onClick={() => removeItem(product.id)} className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => setQty(product.id, quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 font-bold">−</button>
                    <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                    <button onClick={() => setQty(product.id, quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 font-bold">+</button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatPriceShort(product.price * quantity)}</p>
                    {quantity > 1 && <p className="text-xs text-gray-400">{formatPriceShort(product.price)} / pièce</p>}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button onClick={() => clearCart()} className="text-sm text-red-400 hover:text-red-600 transition-colors mt-2">
            Vider le panier
          </button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
            <h2 className="font-extrabold text-gray-900 text-lg mb-5">Récapitulatif</h2>
            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total ({items.length} article{items.length > 1 ? 's' : ''})</span>
                <span className="font-semibold text-gray-900">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span className={shippingCost === 0 ? 'text-green-600 font-semibold' : 'font-semibold text-gray-900'}>
                  {shippingCost === 0 ? 'GRATUITE' : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-extrabold text-gray-900">Total</span>
                <span className="font-extrabold text-xl text-teal-500">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <Link href="/paiement"
              className="block w-full bg-teal-500 hover:bg-teal-600 text-white text-center py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-teal-500/25 active:scale-95">
              Passer commande
            </Link>
            <Link href="/catalogue" className="block text-center text-sm text-gray-500 hover:text-teal-500 mt-3 transition-colors">
              ← Continuer mes achats
            </Link>
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              {['🔒 Paiement 100% sécurisé','✓ Satisfait ou remboursé','🚚 Livraison rapide'].map(t => (
                <p key={t} className="text-xs text-gray-400">{t}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
