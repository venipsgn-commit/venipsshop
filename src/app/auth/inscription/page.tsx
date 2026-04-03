'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function InscriptionPage() {
  const router = useRouter();
  const { register } = useAuth();
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
          <p className="text-center text-sm text-blue-300 mt-6">
            Déjà un compte ?{' '}
            <Link href="/auth/connexion" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
