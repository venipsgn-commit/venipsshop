'use client';

import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/products';
import Image from 'next/image';
import Link from 'next/link';

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-bold text-lg text-gray-900">
            Mon Panier {totalItems > 0 && <span className="text-blue-600">({totalItems})</span>}
          </h2>
          <button
            onClick={closeCart}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="text-6xl">🛒</div>
              <p className="text-gray-500 font-medium">Votre panier est vide</p>
              <button
                onClick={closeCart}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Continuer les achats
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{item.product.name}</p>
                  <p className="text-blue-600 font-semibold text-sm">{formatPrice(item.product.price)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors text-sm"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors text-sm"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-bold text-xl text-gray-900">{formatPrice(totalPrice)}</span>
            </div>
            <Link
              href="/commande"
              onClick={closeCart}
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Passer la commande
            </Link>
            <button
              onClick={closeCart}
              className="block w-full text-center py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Continuer les achats
            </button>
          </div>
        )}
      </div>
    </>
  );
}
