'use client';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function ConnexionForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) {
      router.push(params.get('redirect') ?? '/');
    } else {
      setError(res.error ?? 'Erreur de connexion');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 rounded-xl text-sm text-red-300 border border-red-500/30" style={{background: 'rgba(239,68,68,0.1)'}}>
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-blue-200 mb-1.5">Email</label>
        <input
          type="email" required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-blue-300/50 border border-white/10 focus:outline-none focus:border-teal-400 transition-colors"
          style={{background: 'rgba(255,255,255,0.07)'}}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-blue-200 mb-1.5">Mot de passe</label>
        <input
          type="password" required value={password} onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-blue-300/50 border border-white/10 focus:outline-none focus:border-teal-400 transition-colors"
          style={{background: 'rgba(255,255,255,0.07)'}}
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer text-blue-200">
          <input type="checkbox" className="rounded" />
          <span>Se souvenir de moi</span>
        </label>
        <Link href="/auth/mot-de-passe-oublie" className="text-teal-400 hover:text-teal-300 transition-colors">Mot de passe oublié ?</Link>
      </div>
      <button
        type="submit" disabled={loading}
        className="w-full py-3 rounded-xl font-bold text-white transition-all text-sm disabled:opacity-60"
        style={{background: 'linear-gradient(135deg, #00D8D8, #009090)', boxShadow: '0 8px 24px rgba(0,216,216,0.25)'}}
      >
        {loading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
}

export default function ConnexionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{background: 'linear-gradient(135deg, #020B3A 0%, #041459 50%, #020B3A 100%)'}}>
      {/* Orbes */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{background: 'radial-gradient(circle, rgba(0,216,216,0.1) 0%, transparent 70%)'}} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{background: 'radial-gradient(circle, rgba(0,160,160,0.07) 0%, transparent 70%)'}} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <img src="/venips-logo.png" alt="Venips" className="h-12 w-auto mx-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Connexion</h1>
          <p className="text-blue-300 text-sm mt-1">Bienvenue ! Connectez-vous à votre compte.</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 border border-white/10" style={{background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)'}}>
          <Suspense fallback={<div className="animate-pulse h-64 rounded-xl" style={{background: 'rgba(255,255,255,0.05)'}} />}>
            <ConnexionForm />
          </Suspense>
          <p className="text-center text-sm text-blue-300 mt-6">
            Pas encore de compte ?{' '}
            <Link href="/auth/inscription" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
