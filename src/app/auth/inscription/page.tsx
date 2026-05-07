'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = () => resolve(); s.onerror = reject;
    document.head.appendChild(s);
  });
}

export default function InscriptionPage() {
  const router = useRouter();
  const { register, socialLogin } = useAuth();
  const [form, setForm] = useState({ prenom: '', nom: '', email: '', telephone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (form.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    setLoading(true);
    const res = await register({ nom: form.nom, prenom: form.prenom, email: form.email, telephone: form.telephone, password: form.password });
    setLoading(false);
    if (res.ok) router.push('/');
    else setError(res.error ?? 'Erreur inscription');
  };

  const f = (k: keyof typeof form) => ({ value: form[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [k]: e.target.value })) });

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
            router.push('/');
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

  const handleFacebook = async () => {
    setError('');
    try {
      await loadScript('https://connect.facebook.net/fr_FR/sdk.js');
      const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
      if (!appId) { setError('Facebook App ID non configuré'); return; }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const FB = (window as any).FB;
      if (!FB.getAuthResponse()) {
        FB.init({ appId, cookie: true, xfbml: false, version: 'v18.0' });
      }
      FB.login((loginResponse: { authResponse?: { accessToken: string } }) => {
        if (!loginResponse.authResponse) {
          setError('Connexion Facebook annulée');
          return;
        }
        socialLogin('facebook', loginResponse.authResponse.accessToken).then(res => {
          if (res.ok) {
            router.push('/');
          } else {
            setError(res.error ?? 'Erreur de connexion Facebook');
          }
        });
      }, { scope: 'email,public_profile' });
    } catch {
      setError('Erreur lors de la connexion Facebook');
    }
  };

  const handleApple = async () => {
    setError('');
    try {
      await loadScript('https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AppleID = (window as any).AppleID;
      AppleID.auth.init({
        clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || '',
        scope: 'name email',
        redirectURI: window.location.origin + '/auth/inscription',
        usePopup: true,
      });
      const appleResponse = await AppleID.auth.signIn();
      const token = appleResponse.authorization?.id_token;
      if (!token) { setError('Connexion Apple annulée'); return; }
      const res = await socialLogin('apple', token, {
        firstName: appleResponse.user?.name?.firstName,
        lastName: appleResponse.user?.name?.lastName,
      });
      if (res.ok) {
        router.push('/');
      } else {
        setError(res.error ?? 'Erreur de connexion Apple');
      }
    } catch {
      setError('Erreur lors de la connexion Apple');
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm text-white placeholder-blue-300/50 border border-white/10 focus:outline-none focus:border-teal-400 transition-colors";
  const inputStyle = {background: 'rgba(255,255,255,0.07)'};

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
          <h1 className="text-2xl font-bold text-white">Créer un compte</h1>
          <p className="text-blue-300 text-sm mt-1">Rejoignez Venips et profitez de nos offres exclusives.</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 border border-white/10" style={{background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)'}}>
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm text-red-300 border border-red-500/30" style={{background: 'rgba(239,68,68,0.1)'}}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1.5">Prénom</label>
                <input type="text" required {...f('prenom')} placeholder="Mamadou" className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1.5">Nom</label>
                <input type="text" required {...f('nom')} placeholder="Diallo" className={inputClass} style={inputStyle} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1.5">Email</label>
              <input type="email" required {...f('email')} placeholder="vous@exemple.com" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1.5">Téléphone</label>
              <input type="tel" required {...f('telephone')} placeholder="+224 628 88 34" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1.5">Mot de passe</label>
              <input type="password" required {...f('password')} placeholder="Min. 6 caractères" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1.5">Confirmer le mot de passe</label>
              <input type="password" required {...f('confirm')} placeholder="••••••••" className={inputClass} style={inputStyle} />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white transition-all text-sm mt-2 disabled:opacity-60"
              style={{background: 'linear-gradient(135deg, #00D8D8, #009090)', boxShadow: '0 8px 24px rgba(0,216,216,0.25)'}}
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>
          {/* Séparateur */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-blue-300">ou continuer avec</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Boutons sociaux */}
          <div className="space-y-3">
            <button type="button" onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 text-white text-sm font-semibold transition-all hover:bg-white/10"
              style={{background: 'rgba(255,255,255,0.05)'}}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
              Continuer avec Google
            </button>

            <button type="button" onClick={handleFacebook}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{background: '#1877F2'}}>
              <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Continuer avec Facebook
            </button>

            <button type="button" onClick={handleApple}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{background: '#000000'}}>
              <svg width="16" height="18" fill="white" viewBox="0 0 814 1000"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-150.3-99.1C27.7 753.5 0 622.8 0 504.6c0-224 146.5-342.7 291-342.7 74.8 0 137 49 184.8 49 45.8 0 117.3-52 202.3-52 32.3 0 134.2 3.8 204.6 134.5zM518.7 111.6c23.3-28.1 40.5-67.5 40.5-106.9 0-5.5-.5-11.1-1.6-15.5-38.1 1.4-83.6 25.5-110.4 58.1-21.4 25.7-41.3 65.1-41.3 105.1 0 6 1 12 1.6 14.1 2.2.4 5.8 1 9.4 1 34.6 0 77.1-23.2 101.8-55.9z"/></svg>
              Continuer avec Apple
            </button>
          </div>

          <p className="text-center text-sm text-blue-300 mt-6">
            Déjà un compte ?{' '}
            <Link href="/auth/connexion" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
