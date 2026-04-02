'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-teal-500 text-white rounded-lg w-10 h-10 flex items-center justify-center font-black text-2xl">V</div>
            <span className="font-black text-2xl text-gray-900">Venip<span className="text-teal-500">Shop</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h1>
          <p className="text-gray-500 text-sm mt-1">Entrez votre email pour réinitialiser votre mot de passe.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✉️</span>
              </div>
              <h2 className="font-bold text-gray-900 mb-2">Email envoyé !</h2>
              <p className="text-sm text-gray-500 mb-6">Si un compte existe avec cet email, vous recevrez les instructions de réinitialisation.</p>
              <Link href="/auth/connexion" className="text-teal-500 hover:text-teal-600 font-medium text-sm">Retour à la connexion</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="vous@exemple.com" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm" />
              </div>
              <button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-semibold transition-colors text-sm">
                Envoyer le lien
              </button>
              <p className="text-center text-sm">
                <Link href="/auth/connexion" className="text-gray-500 hover:text-teal-500">← Retour à la connexion</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
