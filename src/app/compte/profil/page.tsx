'use client';
import { useState } from 'react';
import AccountLayout from '@/components/layout/AccountLayout';
import { useAuth } from '@/context/AuthContext';

export default function ProfilPage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
  });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

  if (!user) return null;

  const handleSave = () => {
    updateProfile(form);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePwChange = () => {
    if (pwForm.current !== user.password) { setPwError('Mot de passe actuel incorrect.'); return; }
    if (pwForm.next.length < 6) { setPwError('Le nouveau mot de passe doit faire au moins 6 caractères.'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError('Les mots de passe ne correspondent pas.'); return; }
    updateProfile({ password: pwForm.next });
    setPwForm({ current: '', next: '', confirm: '' });
    setPwError('');
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 3000);
  };

  return (
    <AccountLayout>
      <div className="space-y-6">
        {/* Profile info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-extrabold text-gray-900 text-lg">Informations personnelles</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="text-sm font-semibold text-cyan-500 hover:text-cyan-600">Modifier</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => { setEditing(false); setForm({ nom: user.nom, prenom: user.prenom, email: user.email, telephone: user.telephone }); }}
                  className="text-sm text-gray-500 hover:text-gray-700">Annuler</button>
                <button onClick={handleSave} className="text-sm font-semibold text-cyan-500 hover:text-cyan-600">Enregistrer</button>
              </div>
            )}
          </div>

          {saved && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">✓ Profil mis à jour avec succès.</div>}

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-cyan-500 flex items-center justify-center text-white font-extrabold text-2xl">
              {user.prenom[0]}{user.nom[0]}
            </div>
            <div>
              <p className="font-bold text-gray-900">{user.prenom} {user.nom}</p>
              <p className="text-sm text-gray-500">Membre depuis {new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
              {user.role === 'admin' && <span className="inline-block mt-1 bg-cyan-100 text-cyan-600 text-xs font-bold px-2 py-0.5 rounded-full">Administrateur</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'prenom', label: 'Prénom', type: 'text' },
              { key: 'nom', label: 'Nom', type: 'text' },
              { key: 'email', label: 'Email', type: 'email' },
              { key: 'telephone', label: 'Téléphone', type: 'tel' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{f.label}</label>
                {editing ? (
                  <input
                    type={f.type}
                    value={(form as Record<string, string>)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium px-4 py-2.5 bg-gray-50 rounded-xl text-sm">
                    {(user as unknown as Record<string, string>)[f.key] || '—'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Password change */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-extrabold text-gray-900 text-lg mb-5">Changer le mot de passe</h2>

          {pwSaved && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">✓ Mot de passe modifié avec succès.</div>}
          {pwError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{pwError}</div>}

          <div className="space-y-4 max-w-md">
            {[
              { key: 'current', label: 'Mot de passe actuel', placeholder: '••••••••' },
              { key: 'next', label: 'Nouveau mot de passe', placeholder: 'Au moins 6 caractères' },
              { key: 'confirm', label: 'Confirmer le nouveau mot de passe', placeholder: '••••••••' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{f.label}</label>
                <input
                  type="password"
                  value={(pwForm as Record<string, string>)[f.key]}
                  onChange={e => setPwForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            ))}
            <button onClick={handlePwChange} className="bg-[#080b3b] hover:bg-[#1a2080] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors">
              Mettre à jour le mot de passe
            </button>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
