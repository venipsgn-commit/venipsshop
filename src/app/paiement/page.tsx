'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { orderApi, promoApi } from '@/lib/api';
import { formatPrice, formatPriceShort } from '@/lib/utils';
import { pixel } from '@/lib/pixel';

type Step = 'adresse' | 'confirmation';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice: total, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>('adresse');
  const [promoInput, setPromoInput] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState('');

  const [addr, setAddr] = useState({
    nom: '', prenom: '', rue: '', ville: 'Conakry', telephone: '', commune: '',
  });
  const [addrErrors, setAddrErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setAddr(a => ({
        ...a,
        nom: a.nom || user.nom,
        prenom: a.prenom || user.prenom,
        telephone: a.telephone || user.telephone || '',
      }));
    }
  }, [user]);

  const discountAmt = Math.round(total * promoDiscount / 100);
  const grandTotal = total - discountAmt;

  if (items.length === 0 && !orderNumber) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-gray-500 mb-4">Votre panier est vide.</p>
        <Link href="/catalogue" className="bg-teal-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-teal-600">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await promoApi.validate(code, total);
      setPromoDiscount(res.discount);
      setPromoApplied(code);
      setPromoInput('');
    } catch (e: unknown) {
      setPromoError(e instanceof Error ? e.message : 'Code invalide');
    } finally {
      setPromoLoading(false);
    }
  };

  const validateAddr = () => {
    const errors: Record<string, string> = {};
    if (!addr.nom.trim()) errors.nom = 'Nom requis';
    if (!addr.prenom.trim()) errors.prenom = 'Prénom requis';
    if (!addr.rue.trim()) errors.rue = 'Adresse requise';
    if (!addr.telephone.trim()) errors.telephone = 'Téléphone requis';
    setAddrErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const placeOrder = async () => {
    if (!user) { router.push('/auth/connexion?redirect=/paiement'); return; }
    setPlacing(true);
    setPlaceError('');
    try {
      const order = await orderApi.create({
        items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        paymentMethod: 'CASH',
        promoCode: promoApplied || undefined,
        notes: `Livraison: ${addr.prenom} ${addr.nom}, ${addr.rue}, ${addr.commune ? addr.commune + ', ' : ''}${addr.ville} — Tél: ${addr.telephone}`,
      });
      pixel.purchase(order.orderNumber, grandTotal, items.reduce((s, i) => s + i.quantity, 0));
      clearCart();
      setOrderNumber(order.orderNumber);
    } catch (e: unknown) {
      setPlaceError(e instanceof Error ? e.message : 'Erreur lors de la commande');
    } finally {
      setPlacing(false);
    }
  };

  // Confirmation screen
  if (orderNumber) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center max-w-lg mx-auto py-16">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mb-6">✓</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Commande confirmée !</h1>
        <p className="text-gray-500 mb-1">
          Commande <span className="font-semibold text-gray-900">{orderNumber}</span> passée avec succès.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 my-6 text-left w-full">
          <p className="font-bold text-green-800 mb-1">💵 Paiement à la livraison</p>
          <p className="text-green-700 text-sm">
            Préparez <span className="font-bold">{formatPrice(grandTotal)}</span> en espèces.
            Notre livreur vous contactera au <span className="font-bold">{addr.telephone}</span> avant de passer.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link href="/compte/commandes" className="flex-1 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-bold transition-all text-center">
            Suivre ma commande
          </Link>
          <Link href="/catalogue" className="flex-1 border border-gray-200 hover:border-teal-500 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all text-center">
            Continuer mes achats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Passer commande</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {(['adresse', 'confirmation'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className={`h-px w-8 sm:w-16 ${step === 'confirmation' ? 'bg-teal-500' : 'bg-gray-200'}`} />}
            <div className={`flex items-center gap-2 ${step === s ? 'text-teal-500' : step === 'confirmation' && s === 'adresse' ? 'text-green-500' : 'text-gray-400'}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step === s ? 'border-teal-500 bg-teal-50' : step === 'confirmation' && s === 'adresse' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                {step === 'confirmation' && s === 'adresse' ? '✓' : i + 1}
              </span>
              <span className="hidden sm:block text-sm font-semibold capitalize">
                {s === 'adresse' ? 'Livraison' : 'Confirmation'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">

          {/* Step 1: Address */}
          {step === 'adresse' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-extrabold text-gray-900 text-lg mb-5">Adresse de livraison</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'nom',     label: 'Nom',              placeholder: 'Diallo' },
                  { key: 'prenom',  label: 'Prénom',           placeholder: 'Mamadou' },
                  { key: 'rue',     label: 'Adresse complète', placeholder: 'Quartier, Rue, Commune', full: true },
                  { key: 'commune', label: 'Commune',          placeholder: 'Kaloum, Ratoma...' },
                  { key: 'ville',   label: 'Ville',            placeholder: 'Conakry' },
                  { key: 'telephone', label: 'Téléphone',      placeholder: '+224 628 xxx xxx' },
                ].map(f => (
                  <div key={f.key} className={(f as any).full ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
                    <input
                      type="text"
                      value={(addr as Record<string, string>)[f.key] || ''}
                      onChange={e => setAddr(a => ({ ...a, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${addrErrors[f.key] ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {addrErrors[f.key] && <p className="text-red-500 text-xs mt-1">{addrErrors[f.key]}</p>}
                  </div>
                ))}
              </div>
              {!user && (
                <div className="mt-4 p-3 bg-teal-50 border border-teal-100 rounded-xl text-sm text-teal-700">
                  <Link href="/auth/connexion?redirect=/paiement" className="font-semibold underline">Connectez-vous</Link> pour un checkout plus rapide.
                </div>
              )}
              <button
                onClick={() => { if (validateAddr()) setStep('confirmation'); }}
                className="w-full mt-6 bg-teal-500 hover:bg-teal-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-teal-500/25"
              >
                Continuer →
              </button>
            </div>
          )}

          {/* Step 2: Confirmation */}
          {step === 'confirmation' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-extrabold text-gray-900 text-lg">Confirmer la commande</h2>

              {/* Cash on delivery info */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-4 items-start">
                <span className="text-3xl">💵</span>
                <div>
                  <p className="font-bold text-green-800">Paiement à la livraison</p>
                  <p className="text-green-700 text-sm mt-0.5">
                    Vous payez en espèces quand notre livreur arrive chez vous.
                    Préparez le montant exact : <span className="font-bold">{formatPrice(grandTotal)}</span>.
                  </p>
                </div>
              </div>

              {/* Address recap */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Livraison à</p>
                <p className="font-semibold text-gray-900">{addr.prenom} {addr.nom}</p>
                <p className="text-sm text-gray-600">{addr.rue}{addr.commune ? `, ${addr.commune}` : ''}, {addr.ville}</p>
                <p className="text-sm text-gray-600">{addr.telephone}</p>
                <button onClick={() => setStep('adresse')} className="text-xs text-teal-500 hover:text-teal-600 font-medium mt-2">
                  Modifier l'adresse
                </button>
              </div>

              {placeError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{placeError}</div>
              )}

              <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-teal-500/25 text-base"
              >
                {placing ? 'Traitement en cours...' : `Confirmer la commande – ${formatPrice(grandTotal)}`}
              </button>
              <p className="text-xs text-gray-400 text-center">
                En confirmant, vous acceptez nos <Link href="/cgv" className="underline hover:text-teal-500">conditions générales de vente</Link>.
              </p>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
            <h3 className="font-extrabold text-gray-900 mb-4">Votre commande</h3>
            <div className="space-y-3 mb-4 max-h-56 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                    <Image src={product.images[0]} alt={product.name} fill className="object-contain p-1" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                    <p className="text-xs text-gray-400">× {quantity}</p>
                  </div>
                  <p className="text-xs font-bold text-gray-900 flex-shrink-0">{formatPriceShort(product.price * quantity)}</p>
                </div>
              ))}
            </div>

            {/* Promo code */}
            <div className="border-t border-gray-100 pt-4 mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Code promo</label>
              {promoApplied ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                  <span className="text-green-700 text-xs font-bold">✓ {promoApplied} (-{promoDiscount}%)</span>
                  <button onClick={() => { setPromoApplied(''); setPromoDiscount(0); }} className="text-gray-400 text-xs hover:text-red-500">✕</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Ex: VENIPS10"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono uppercase"
                  />
                  <button
                    onClick={applyPromo}
                    disabled={promoLoading}
                    className="bg-gray-900 hover:bg-gray-700 disabled:opacity-60 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                  >
                    {promoLoading ? '...' : 'OK'}
                  </button>
                </div>
              )}
              {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
            </div>

            <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
              {discountAmt > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Réduction ({promoDiscount}%)</span>
                  <span className="font-semibold">-{formatPrice(discountAmt)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span className="text-green-600 font-semibold">Gratuite</span>
              </div>
              <div className="flex justify-between font-extrabold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total à payer</span>
                <span className="text-teal-500">{formatPrice(grandTotal)}</span>
              </div>
              <p className="text-xs text-gray-400 text-center pt-1">💵 Paiement en espèces à la livraison</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
