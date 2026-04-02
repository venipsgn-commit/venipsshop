'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/storage';

export default function CartSidebar() {
  const { items, isOpen, close, removeItem, setQty, totalPrice, totalItems } = useCart();
  const delivery = totalPrice >= 100000 ? 0 : 5000;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={close} />}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
          <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Mon Panier
            {totalItems > 0 && <span className="bg-cyan-500 text-white text-xs rounded-full px-2 py-0.5">{totalItems}</span>}
          </h2>
          <button onClick={close} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Votre panier est vide</p>
                <p className="text-sm text-gray-400 mt-1">Ajoutez des produits pour commencer</p>
              </div>
              <button onClick={close} className="bg-cyan-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-cyan-600 transition-colors text-sm">
                Continuer les achats
              </button>
            </div>
          ) : items.map(item => (
            <div key={item.product.id} className="flex gap-3 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors">
              <Link href={`/produit/${item.product.id}`} onClick={close} className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" unoptimized />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/produit/${item.product.id}`} onClick={close}>
                  <p className="font-medium text-sm text-gray-900 hover:text-cyan-500 transition-colors truncate">{item.product.name}</p>
                </Link>
                <p className="text-cyan-500 font-bold text-sm">{formatPrice(item.product.price)}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => setQty(item.product.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors font-bold">−</button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => setQty(item.product.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors font-bold">+</button>
                  </div>
                  <button onClick={() => removeItem(item.product.id)} className="ml-auto p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3 bg-gray-50">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span><span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span className={delivery === 0 ? 'text-emerald-600 font-medium' : ''}>{delivery === 0 ? 'Gratuite ✓' : formatPrice(delivery)}</span>
              </div>
              {delivery > 0 && <p className="text-xs text-gray-400">Livraison gratuite dès {formatPrice(100000)}</p>}
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span className="text-cyan-500">{formatPrice(totalPrice + delivery)}</span>
            </div>
            <Link href="/paiement" onClick={close} className="block w-full bg-cyan-500 hover:bg-cyan-600 text-white text-center py-3.5 rounded-xl font-bold transition-colors text-sm">
              Commander →
            </Link>
            <button onClick={close} className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 py-1 transition-colors">
              Continuer les achats
            </button>
          </div>
        )}
      </div>
    </>
  );
}
