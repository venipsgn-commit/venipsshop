'use client';
import { useState, useEffect } from 'react';

const BANNER_KEY = 'venips_banner_dismissed';
const BANNER_TEXT = '🚚 Livraison gratuite partout en Guinée · Paiement à la livraison · Produits 100% authentiques';

export default function PromoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(BANNER_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(BANNER_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="relative bg-teal-600 text-white text-xs sm:text-sm py-2.5 px-4 text-center font-medium">
      <span>{BANNER_TEXT}</span>
      <button
        onClick={dismiss}
        aria-label="Fermer"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
