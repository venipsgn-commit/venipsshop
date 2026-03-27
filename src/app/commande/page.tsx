'use client';

import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/products';
import { saveOrder } from '@/lib/orders';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

function getMinDeliveryDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(8, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

export default function CommandePage() {
  const { items, totalPrice, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    pays: 'Sénégal',
    paiement: 'orange-money',
    transiteur: '',
    dateLivraison: getMinDeliveryDate(),
  });

  const delivery = totalPrice >= 150000 ? 0 : 5000;
  const total = totalPrice + delivery;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `CMD-${Date.now()}`;
    setOrderId(id);
    saveOrder({
      id,
      createdAt: new Date().toISOString(),
      prenom: form.prenom,
      nom: form.nom,
      email: form.email,
      telephone: form.telephone,
      adresse: form.adresse,
      ville: form.ville,
      pays: form.pays,
      paiement: form.paiement,
      transiteur: form.transiteur,
      dateLivraison: new Date(form.dateLivraison).toISOString(),
      items: items.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
      })),
      total,
      statut: 'en_transit',
      alertDismissed: false,
    });
    clearCart();
    setSubmitted(true);
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

          <div className="bg-blue-50 rounded-2xl p-4 mb-5 text-left space-y-2">
            <p className="text-sm text-gray-600 flex justify-between">
              <span className="font-medium">N° de commande</span>
              <span className="text-blue-600 font-bold">{orderId.slice(-10).toUpperCase()}</span>
            </p>
            <p className="text-sm text-gray-600 flex justify-between">
              <span className="font-medium">Transiteur</span>
              <span className="font-semibold">{form.transiteur}</span>
            </p>
            <p className="text-sm text-gray-600 flex justify-between">
              <span className="font-medium">Livraison prévue</span>
              <span className="font-semibold">
                {new Date(form.dateLivraison).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </p>
            <p className="text-sm text-gray-600 flex justify-between">
              <span className="font-medium">Total payé</span>
              <span className="text-blue-600 font-bold">{formatPrice(total)}</span>
            </p>
          </div>

          <p className="text-gray-500 text-sm mb-6">
            Une alerte vous sera affichée automatiquement à la date de livraison prévue.
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
          <Link href="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-block">
            Parcourir la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-blue-600 transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Commande</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Finaliser la commande</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  <input type="text" required value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Prénom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input type="text" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Nom de famille" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="email@exemple.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                  <input type="tel" required value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="+221 77 000 00 00" />
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
                  <input type="text" required value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Rue, quartier, numéro..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                    <input type="text" required value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Dakar" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                    <select value={form.pays} onChange={(e) => setForm({ ...form, pays: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
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

            {/* Transiteur & Livraison */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Transiteur & Date de livraison
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du transiteur / livreur
                    <span className="ml-1 text-xs text-gray-400 font-normal">(optionnel — personne ou société chargée de la livraison)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={form.transiteur}
                      onChange={(e) => setForm({ ...form, transiteur: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex : Mamadou Diallo, DHL Express, LaPoste..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date et heure de livraison prévue *
                    <span className="ml-1 text-xs text-gray-400 font-normal">(une alerte s&apos;affichera à cette date)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <input
                      type="datetime-local"
                      required
                      min={getMinDeliveryDate()}
                      value={form.dateLivraison}
                      onChange={(e) => setForm({ ...form, dateLivraison: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-orange-600 mt-1.5 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Une notification s&apos;affichera automatiquement quand la livraison est attendue
                  </p>
                </div>
              </div>
            </div>

            {/* Paiement */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                Mode de paiement
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'orange-money', label: 'Orange Money', icon: '🟠', desc: 'Paiement mobile sécurisé' },
                  { value: 'wave', label: 'Wave', icon: '🔵', desc: 'Transfert Wave rapide' },
                  { value: 'carte', label: 'Carte bancaire', icon: '💳', desc: 'Visa, Mastercard' },
                  { value: 'livraison', label: 'Paiement à la livraison', icon: '💵', desc: 'Espèces à la réception' },
                ].map((option) => (
                  <label key={option.value}
                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${
                      form.paiement === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input type="radio" name="paiement" value={option.value} checked={form.paiement === option.value}
                      onChange={(e) => setForm({ ...form, paiement: e.target.value })} className="text-blue-600" />
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

          {/* Récapitulatif */}
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

              {/* Delivery info preview */}
              {(form.transiteur || form.dateLivraison) && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-4 space-y-1">
                  {form.transiteur && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">🚚 Transiteur :</span> {form.transiteur}
                    </p>
                  )}
                  {form.dateLivraison && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">📅 Livraison :</span>{' '}
                      {new Date(form.dateLivraison).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  )}
                </div>
              )}

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

              <button type="submit"
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold mt-5 hover:bg-blue-700 active:scale-95 transition-all text-sm">
                Confirmer la commande
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">🔒 Paiement 100% sécurisé</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
