import { useState, useEffect } from 'react';
import api from '../../lib/api';

const JOURS = ['LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI','DIMANCHE'];
const DISCIPLINES = ['BOXE','MMA'];
const NIVEAUX = ['LOISIR','COMPETITION','JEUNES'];
const empty = { nom:'', discipline:'BOXE', niveau:'LOISIR', jour:'LUNDI', heureDebut:'', heureFin:'', capacite:20, description:'' };

export default function AdminCours() {
  const [cours, setCours] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => { const { data } = await api.get('/cours'); setCours(data); };
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const hc = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/cours/${editing}`, form); } else { await api.post('/cours', form); }
      setShowForm(false); setForm(empty); setEditing(null); load();
    } catch (err) { alert(err.response?.data?.error || 'Erreur'); }
  };

  const handleEdit = (c) => {
    setForm({ nom:c.nom, discipline:c.discipline, niveau:c.niveau, jour:c.jour, heureDebut:c.heureDebut, heureFin:c.heureFin, capacite:c.capacite, description:c.description||'' });
    setEditing(c.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Desactiver ce cours ?')) return;
    await api.delete(`/cours/${id}`); load();
  };

  const sel = "bg-noir border border-white/10 px-3 py-2 text-white font-inter text-sm focus:border-rouge outline-none";
  const inp = "bg-noir border border-white/10 px-3 py-2 text-white font-inter text-sm focus:border-rouge outline-none w-full";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><p className="font-inter text-xs uppercase tracking-[0.3em] text-rouge mb-1">Gestion</p><h1 className="font-bebas text-4xl text-white">COURS & CRENEAUX</h1></div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(empty); }} className="btn-rouge text-xs py-2.5 px-5">+ Nouveau creneau</button>
      </div>
      {showForm && (
        <div className="card-noir p-6 mb-6">
          <h2 className="font-bebas text-2xl text-white mb-5">{editing ? 'MODIFIER' : 'NOUVEAU CRENEAU'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block font-inter text-[10px] text-white/30 uppercase tracking-widest mb-1">Nom</label>
              <input name="nom" value={form.nom} onChange={hc} required className={inp} />
            </div>
            <div><label className="block font-inter text-[10px] text-white/30 uppercase tracking-widest mb-1">Discipline</label><select name="discipline" value={form.discipline} onChange={hc} className={sel}>{DISCIPLINES.map((d) => <option key={d}>{d}</option>)}</select></div>
            <div><label className="block font-inter text-[10px] text-white/30 uppercase tracking-widest mb-1">Niveau</label><select name="niveau" value={form.niveau} onChange={hc} className={sel}>{NIVEAUX.map((n) => <option key={n}>{n}</option>)}</select></div>
            <div><label className="block font-inter text-[10px] text-white/30 uppercase tracking-widest mb-1">Jour</label><select name="jour" value={form.jour} onChange={hc} className={sel}>{JOURS.map((j) => <option key={j}>{j}</option>)}</select></div>
            <div><label className="block font-inter text-[10px] text-white/30 uppercase tracking-widest mb-1">Debut</label><input name="heureDebut" value={form.heureDebut} onChange={hc} required placeholder="18:00" className={inp} /></div>
            <div><label className="block font-inter text-[10px] text-white/30 uppercase tracking-widest mb-1">Fin</label><input name="heureFin" value={form.heureFin} onChange={hc} required placeholder="19:30" className={inp} /></div>
            <div><label className="block font-inter text-[10px] text-white/30 uppercase tracking-widest mb-1">Capacite</label><input type="number" name="capacite" value={form.capacite} onChange={hc} className={inp} /></div>
            <div className="col-span-2 flex gap-3 pt-2">
              <button type="submit" className="btn-rouge text-xs py-2 px-5">{editing ? 'Modifier' : 'Creer'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-xs py-2 px-5">Annuler</button>
            </div>
          </form>
        </div>
      )}
      <div className="card-noir overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-white/10">{['Nom','Discipline','Niveau','Jour','Horaire','Cap.',''].map((h) => <th key={h} className="text-left px-4 py-3 font-inter text-[10px] uppercase tracking-widest text-white/30">{h}</th>)}</tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="text-center py-8 font-inter text-sm text-white/30">Chargement...</td></tr>
            : cours.map((c) => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/3">
                <td className="px-4 py-3 font-inter text-sm text-white">{c.nom}</td>
                <td className="px-4 py-3"><span className={`font-inter text-[10px] border px-2 py-0.5 ${c.discipline === 'BOXE' ? 'border-rouge text-rouge' : 'border-blue-400/40 text-blue-400/60'}`}>{c.discipline}</span></td>
                <td className="px-4 py-3 font-inter text-xs text-white/50">{c.niveau}</td>
                <td className="px-4 py-3 font-inter text-xs text-white/50">{c.jour}</td>
                <td className="px-4 py-3 font-inter text-xs text-rouge">{c.heureDebut}–{c.heureFin}</td>
                <td className="px-4 py-3 font-inter text-xs text-white/50">{c.capacite}</td>
                <td className="px-4 py-3 flex gap-3">
                  <button onClick={() => handleEdit(c)} className="font-inter text-xs text-white/40 hover:text-white transition-colors">Modifier</button>
                  <button onClick={() => handleDelete(c.id)} className="font-inter text-xs text-rouge/50 hover:text-rouge transition-colors">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
