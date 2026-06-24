import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
export default function Profil() {
  const { user } = useAuth();
  const [form, setForm] = useState({ nom: user?.nom || '', prenom: user?.prenom || '', telephone: user?.telephone || '' });
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const fieldClass = "w-full bg-noir border border-white/10 px-4 py-2.5 text-white font-inter text-sm focus:border-rouge outline-none transition-colors";
  const labelClass = "block font-inter text-xs text-white/40 uppercase tracking-widest mb-1.5";
  const saveProfil = async (e) => { e.preventDefault(); setMsg(''); setError(''); try { await api.put('/membre/profil', form); setMsg('Profil mis a jour.'); } catch { setError('Erreur.'); } };
  const savePassword = async (e) => {
    e.preventDefault(); setMsg(''); setError('');
    if (pwd.newPassword !== pwd.confirm) return setError('Les mots de passe ne correspondent pas.');
    try { await api.put('/membre/password', { currentPassword: pwd.currentPassword, newPassword: pwd.newPassword }); setPwd({ currentPassword: '', newPassword: '', confirm: '' }); setMsg('Mot de passe mis a jour.'); }
    catch (err) { setError(err.response?.data?.error || 'Erreur'); }
  };
  return (
    <div className="max-w-lg">
      <div className="mb-8"><p className="font-inter text-xs uppercase tracking-[0.3em] text-rouge mb-1">Parametres</p><h1 className="font-bebas text-4xl text-white">MON PROFIL</h1></div>
      {msg && <div className="bg-green-900/20 border border-green-500/30 text-green-400 font-inter text-xs px-4 py-3 mb-6">{msg}</div>}
      {error && <div className="bg-rouge/10 border border-rouge/30 text-rouge font-inter text-xs px-4 py-3 mb-6">{error}</div>}
      <form onSubmit={saveProfil} className="card-noir p-6 mb-4 space-y-4">
        <p className="font-bebas text-xl text-white mb-2">INFORMATIONS PERSONNELLES</p>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Prenom</label><input name="prenom" value={form.prenom} onChange={(e) => setForm(f => ({...f, prenom: e.target.value}))} className={fieldClass} /></div>
          <div><label className={labelClass}>Nom</label><input name="nom" value={form.nom} onChange={(e) => setForm(f => ({...f, nom: e.target.value}))} className={fieldClass} /></div>
        </div>
        <div><label className={labelClass}>Email</label><input value={user?.email} disabled className={`${fieldClass} opacity-40 cursor-not-allowed`} /></div>
        <div><label className={labelClass}>Telephone</label><input name="telephone" value={form.telephone} onChange={(e) => setForm(f => ({...f, telephone: e.target.value}))} className={fieldClass} /></div>
        <button type="submit" className="btn-rouge text-xs py-2.5">Enregistrer</button>
      </form>
      <form onSubmit={savePassword} className="card-noir p-6 space-y-4">
        <p className="font-bebas text-xl text-white mb-2">MOT DE PASSE</p>
        <div><label className={labelClass}>Mot de passe actuel</label><input type="password" value={pwd.currentPassword} onChange={(e) => setPwd(p => ({...p, currentPassword: e.target.value}))} className={fieldClass} /></div>
        <div><label className={labelClass}>Nouveau mot de passe</label><input type="password" value={pwd.newPassword} onChange={(e) => setPwd(p => ({...p, newPassword: e.target.value}))} className={fieldClass} /></div>
        <div><label className={labelClass}>Confirmer</label><input type="password" value={pwd.confirm} onChange={(e) => setPwd(p => ({...p, confirm: e.target.value}))} className={fieldClass} /></div>
        <button type="submit" className="btn-rouge text-xs py-2.5">Changer le mot de passe</button>
      </form>
    </div>
  );
}
