'use client';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = () => resolve(); s.onerror = reject;
    document.head.appendChild(s);
  });
}

function ConnexionForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, socialLogin } = useAuth();
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

  const handleGoogle = async () => {
    setError('');
    try {
      await loadScript('https://accounts.google.com/gsi/client');
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) { setError('Google Client ID non configuré'); return; }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const google = (window as any).google;
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile',
        callback: async (response: { access_token?: string; error?: string }) => {
          if (response.error || !response.access_token) {
            setError('Connexion Google annulée');
            return;
          }
          const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${response.access_token}` },
          }).then(r => r.json());
          const res = await socialLogin('google', response.access_token, {
            firstName: userInfo.given_name,
            lastName: userInfo.family_name,
          });
          if (res.ok) {
            router.push(params.get('redirect') ?? '/');
          } else {
            setError(res.error ?? 'Erreur de connexion Google');
          }
        },
      });
      client.requestAccessToken();
    } catch {
      setError('Erreur lors de la connexion Google');
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

      <div className="flex items-center gap-3 my-2">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-blue-300">ou continuer avec</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <button type="button" onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 text-white text-sm font-semibold transition-all hover:bg-white/10"
        style={{background: 'rgba(255,255,255,0.05)'}}>
        <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
        Continuer avec Google
      </button>
    </form>
  );
}

export default function ConnexionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{background: 'linear-gradient(135deg, #020B3A 0%, #041459 50%, #020B3A 100%)'}}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl" style={{background: 'radial-gradient(circle, rgba(0,216,216,0.1) 0%, transparent 70%)'}} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl" style={{background: 'radial-gradient(circle, rgba(0,160,160,0.07) 0%, transparent 70%)'}} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <img src="/venips-logo.png" alt="Venips" className="h-12 w-auto mx-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Connexion</h1>
          <p className="text-blue-300 text-sm mt-1">Bienvenue ! Connectez-vous à votre compte.</p>
        </div>

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
