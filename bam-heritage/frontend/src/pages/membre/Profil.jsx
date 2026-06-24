import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

export default function Profil() {
  const { user } = useAuth();
  const [form, setForm] = useState({ nom: user?.nom || '', prenom: user?.prenom || '', telephone: user?.telephone || '' });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fc = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const fp = (e) => setPwd((p) => ({ ...p, [e.target.name]: e.target.value }));
  const ic = "w-full bg-noir border border-white/10 px-4 py-2.5 text-white font-inter text-sm focus:border-rouge outline-none transition-colors";
  const lc = "block font-inter text-xs text-white/40 uppercase tracking-widest mb-1.5";

  const saveProfil = async (e) => {
    e.preventDefault(); setMsg(''); setError('');
    try { await api.put('/membre/profil', form); setMsg('Profil mis a jour.'); }
    catch { setError('Erreur lors de la mise a jour.'); }
  };

  const savePassword = async (e) => {
    e.preventDefault(); setMsg(''); setError('');
    if (pwd.newPassword !== pwd.confirm) return setError('Les mots de passe ne correspondent pas.');
    try {
      await api.put('/membre/password', { currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
      setMsg('Mot de passe mis a jour.');
    } catch (err) { setError(err.response?.data?.error || 'Erreur'); }
  };

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <p className="font-inter text-xs uppercase tracking-[0.3em] text-rouge mb-1">Parametres</p>
        <h1 className="font-bebas text-4xl text-white">MON PROFIL</h1>
      </div>
      {msg && <div className="bg-green-900/20 border border-green-500/30 text-green-400 font-inter text-xs px-4 py-3 mb-6">{msg}</div>}
      {error && <div className="bg-rouge/10 border border-rouge/30 text-rouge font-inter text-xs px-4 py-3 mb-6">{error}</div>}
      <form onSubmit={saveProfil} className="card-noir p-6 mb-4 space-y-4">
        <p className="font-bebas text-xl text-white mb-2">INFORMATIONS PERSONNELLES</p>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={lc}>Prenom</label><input name="prenom" value={form.prenom} onChange={fc} className={ic} /></div>
          <div><label className={lc}>Nom</label><input name="nom" value={form.nom} onChange={fc} className={ic} /></div>
        </div>
        <div><label className={lc}>Email</label><input value={user?.email} disabled className={`${ic} opacity-40 cursor-not-allowed`} /></div>
        <div><label className={lc}>Telephone</label><input name="telephone" value={form.telephone} onChange={fc} className={ic} /></div>
        <button type="submit" className="btn-rouge text-xs py-2.5">Enregistrer</button>
      </form>
      <form onSubmit={savePassword} className="card-noir p-6 space-y-4">
        <p className="font-bebas text-xl text-white mb-2">MOT DE PASSE</p>
        <div><label className={lc}>Mot de passe actuel</label><input type="password" name="currentPassword" value={pwd.currentPassword} onChange={fp} className={ic} /></div>
        <div><label className={lc}>Nouveau mot de passe</label><input type="password" name="newPassword" value={pwd.newPassword} onChange={fp} className={ic} /></div>
        <div><label className={lc}>Confirmer</label><input type="password" name="confirm" value={pwd.confirm} onChange={fp} className={ic} /></div>
        <button type="submit" className="btn-rouge text-xs py-2.5">Changer le mot de passe</button>
      </form>
    </div>
  );
}
