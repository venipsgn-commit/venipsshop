'use client';

import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/products';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function CommandePage() {
  const { items, totalPrice, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    pays: 'Sénégal',
    paiement: 'orange-money',
  });

  const delivery = totalPrice >= 150000 ? 0 : 5000;
  const total = totalPrice + delivery;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    clearCart();
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Commande confirmée !</h1>
          <p className="text-gray-600 mb-2">
            Merci pour votre achat, <strong>{form.prenom} {form.nom}</strong> !
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Un email de confirmation a été envoyé à <strong>{form.email}</strong>. Vous serez livré dans 24 à 48 heures.
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            Retour à la boutique
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Votre panier est vide</h1>
          <p className="text-gray-500 mb-8">Ajoutez des produits avant de passer commande.</p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            Parcourir la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-blue-600 transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Commande</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Finaliser la commande</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Infos personnelles */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Informations personnelles
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nom de famille"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@exemple.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    value={form.telephone}
                    onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+221 77 000 00 00"
                  />
                </div>
              </div>
            </div>

            {/* Adresse livraison */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Adresse de livraison
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                  <input
                    type="text"
                    required
                    value={form.adresse}
                    onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Rue, quartier, numéro..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                    <input
                      type="text"
                      required
                      value={form.ville}
                      onChange={(e) => setForm({ ...form, ville: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Dakar"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                    <select
                      value={form.pays}
                      onChange={(e) => setForm({ ...form, pays: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option>Sénégal</option>
                      <option>Côte d&apos;Ivoire</option>
                      <option>Mali</option>
                      <option>Guinée</option>
                      <option>Cameroun</option>
                      <option>France</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Paiement */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Mode de paiement
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'orange-money', label: 'Orange Money', icon: '🟠', desc: 'Paiement mobile sécurisé' },
                  { value: 'wave', label: 'Wave', icon: '🔵', desc: 'Transfert Wave rapide' },
                  { value: 'carte', label: 'Carte bancaire', icon: '💳', desc: 'Visa, Mastercard' },
                  { value: 'livraison', label: 'Paiement à la livraison', icon: '💵', desc: 'Espèces à la réception' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${
                      form.paiement === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paiement"
                      value={option.value}
                      checked={form.paiement === option.value}
                      onChange={(e) => setForm({ ...form, paiement: e.target.value })}
                      className="text-blue-600"
                    />
                    <span className="text-2xl">{option.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-5">Récapitulatif</h2>

              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 items-center">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover" unoptimized />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Qté: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Livraison</span>
                  <span className={delivery === 0 ? 'text-emerald-600 font-medium' : ''}>
                    {delivery === 0 ? 'Gratuite' : formatPrice(delivery)}
                  </span>
                </div>
                {delivery === 0 && (
                  <p className="text-xs text-emerald-600">✓ Livraison offerte dès 150 000 FCFA</p>
                )}
                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-blue-600">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold mt-5 hover:bg-blue-700 active:scale-95 transition-all text-sm"
              >
                Confirmer la commande
              </button>
              <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                🔒 Paiement 100% sécurisé
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
