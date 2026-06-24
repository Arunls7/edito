import { useState, useEffect } from 'react';
import api from '../../lib/api';
const emptyForm = { nom: '', description: '', date: '', lieu: '', prix: '', placesTotal: '', imageUrl: '' };
export default function AdminEvenements() {
  const [evenements, setEvenements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const load = () => api.get('/evenements/admin').then(({ data }) => setEvenements(data));
  useEffect(() => { load().finally(() => setLoading(false)); }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.post('/evenements', { ...form, prix: parseFloat(form.prix), placesTotal: parseInt(form.placesTotal) }); setShowForm(false); setForm(emptyForm); load(); }
    catch (err) { alert(err.response?.data?.error || 'Erreur (verifiez votre cle Stripe)'); }
  };
  const toggleActif = async (id, actif) => { await api.put(`/evenements/${id}`, { actif: !actif }); load(); };
  const inp = "bg-noir border border-white/10 px-3 py-2 text-white font-inter text-sm focus:border-rouge outline-none w-full";
  return (
    <div>
      <div className="flex items-center justify-between mb-8"><div><p className="font-inter text-xs uppercase tracking-[0.3em] text-rouge mb-1">Billetterie</p><h1 className="font-bebas text-4xl text-white">EVENEMENTS</h1></div><button onClick={() => setShowForm(true)} className="btn-rouge text-xs py-2.5 px-5">+ Creer un evenement</button></div>
      {showForm && (
        <div className="card-noir p-6 mb-6">
          <h2 className="font-bebas text-2xl text-white mb-5">NOUVEL EVENEMENT</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="block font-inter text-[10px] text-white/30 uppercase tracking-widest mb-1">Nom</label><input name="nom" value={form.nom} onChange={(e) => setForm(f => ({...f, nom: e.target.value}))} required className={inp} /></div>
            <div><label className="block font-inter text-[10px] text-white/30 uppercase tracking-widest mb-1">Date</label><input type="datetime-local" value={form.date} onChange={(e) => setForm(f => ({...f, date: e.target.value}))} required className={inp} /></div>
            <div><label className="block font-inter text-[10px] text-white/30 uppercase tracking-widest mb-1">Lieu</label><input value={form.lieu} onChange={(e) => setForm(f => ({...f, lieu: e.target.value}))} required className={inp} /></div>
            <div><label className="block font-inter text-[10px] text-white/30 uppercase tracking-widest mb-1">Prix (€)</label><input type="number" step="0.01" value={form.prix} onChange={(e) => setForm(f => ({...f, prix: e.target.value}))} required className={inp} /></div>
            <div><label className="block font-inter text-[10px] text-white/30 uppercase tracking-widest mb-1">Places</label><input type="number" value={form.placesTotal} onChange={(e) => setForm(f => ({...f, placesTotal: e.target.value}))} required className={inp} /></div>
            <div className="md:col-span-2"><label className="block font-inter text-[10px] text-white/30 uppercase tracking-widest mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm(f => ({...f, description: e.target.value}))} rows={3} className={`${inp} resize-none`} /></div>
            <div className="md:col-span-2 flex gap-3"><button type="submit" className="btn-rouge text-xs py-2 px-5">Creer + Stripe</button><button type="button" onClick={() => setShowForm(false)} className="btn-outline text-xs py-2 px-5">Annuler</button></div>
          </form>
        </div>
      )}
      <div className="space-y-[2px]">
        {loading ? <div className="text-white/30 font-inter text-sm">Chargement...</div> : evenements.map((e) => (
          <div key={e.id} className="card-noir p-5 flex items-center justify-between gap-4">
            <div><div className="flex items-center gap-3 mb-1"><span className={`w-2 h-2 rounded-full ${e.actif ? 'bg-green-400' : 'bg-white/20'}`} /><h3 className="font-bebas text-xl text-white">{e.nom}</h3></div><p className="font-inter text-xs text-white/30">{new Date(e.date).toLocaleDateString('fr-FR')} · {e.lieu} · {e.prix}€ · {e.placesRestantes}/{e.placesTotal} places</p></div>
            <button onClick={() => toggleActif(e.id, e.actif)} className={`font-inter text-xs uppercase tracking-widest border px-4 py-2 transition-colors ${e.actif ? 'border-rouge text-rouge hover:bg-rouge hover:text-white' : 'border-white/20 text-white/40 hover:border-white/40 hover:text-white'}`}>{e.actif ? 'Desactiver' : 'Activer'}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
