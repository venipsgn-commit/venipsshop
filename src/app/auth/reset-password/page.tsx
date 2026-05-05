'use client';
import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Mot de passe trop court (8 caractères min)'); return; }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push('/auth/connexion'), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-red-500 mb-4">Lien invalide.</p>
        <Link href="/auth/mot-de-passe-oublie" className="text-teal-500 hover:text-teal-600 font-medium text-sm">
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="font-bold text-gray-900 mb-2">Mot de passe modifié !</h2>
        <p className="text-sm text-gray-500">Redirection vers la connexion...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nouveau mot de passe</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Min. 8 caractères"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le mot de passe</label>
        <input
          type="password"
          required
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors text-sm"
      >
        {loading ? 'Modification...' : 'Modifier le mot de passe'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-teal-500 text-white rounded-lg w-10 h-10 flex items-center justify-center font-black text-2xl">V</div>
            <span className="font-black text-2xl text-gray-900">Venip<span className="text-teal-500">Shop</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau mot de passe</h1>
          <p className="text-gray-500 text-sm mt-1">Choisis un nouveau mot de passe pour ton compte.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Suspense fallback={<p className="text-center text-gray-400 text-sm">Chargement...</p>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
