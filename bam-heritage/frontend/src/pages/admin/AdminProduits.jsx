import { useState, useEffect } from 'react';
import api from '../../lib/api';

const empty = { nom:'', description:'', prix:'', stock:'', imageUrl:'', categorie:'' };

export default function AdminProduits() {
  const [produits, setProduits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/produits/admin').then(({ data }) => setProduits(data));
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const hc = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const inp = "bg-noir border border-white/10 px-3 py-2 text-white font-inter text-sm focus:border-rouge outline-none w-full";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/produits', { ...form, prix: parseFloat(form.prix), stock: parseInt(form.stock) });
      setShowForm(false); setForm(empty); load();
    } catch (err) { alert(err.response?.data?.error || 'Erreur (verifiez votre cle Stripe)'); }
  };

  const toggleActif = async (id, actif) => { await api.put(`/produits/${id}`, { actif: !actif }); load(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><p className="font-inter text-xs uppercase tracking-[0.3em] text-rouge mb-1">Boutique</p><h1 className="font-bebas text-4xl text-white">PRODUITS</h1></div>
        <button onClick={() => setShowForm(true)} className="btn-rouge text-xs py-2.5 px-5">+ Nouveau produit</button>
      </div>
      {showForm && (
        <div className="card-noir p-6 mb-6">
          <h2 className="font-bebas text-2xl text-white mb-5">NOUVEAU PRODUIT</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block font-inter text-[10px] text-white/30 uppercase tracking-widest mb-1">Nom</label><input name="nom" value={form.nom} onChange={hc} required className={inp} /></div>
            <div><label className="block font-inter text-[10px] text-white/30 uppercase tracking-widest mb-1">Categorie</label><input name="categorie" value={form.categorie} onChange={hc} placeholder="Gants, T-shirts..." className={inp} /></div>
            <div><label className="block font-inter text-[10px] text-white/30 uppercase tracking-widest mb-1">Prix (EUR)</label><input type="number" step="0.01" name="prix" value={form.prix} onChange={hc} required className={inp} /></div>
            <div><label className="block font-inter text-[10px] text-white/30 uppercase tracking-widest mb-1">Stock</label><input type="number" name="stock" value={form.stock} onChange={hc} required className={inp} /></div>
            <div className="md:col-span-2"><label className="block font-inter text-[10px] text-white/30 uppercase tracking-widest mb-1">Description</label><textarea name="description" value={form.description} onChange={hc} rows={2} className={`${inp} resize-none`} /></div>
            <div className="md:col-span-2"><label className="block font-inter text-[10px] text-white/30 uppercase tracking-widest mb-1">URL Image</label><input name="imageUrl" value={form.imageUrl} onChange={hc} placeholder="https://..." className={inp} /></div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-rouge text-xs py-2 px-5">Creer + Stripe</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-xs py-2 px-5">Annuler</button>
            </div>
          </form>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2px]">
        {loading ? <div className="text-white/30 font-inter text-sm">Chargement...</div>
        : produits.map((p) => (
          <div key={p.id} className="card-noir p-5">
            <div className="flex items-start justify-between mb-3">
              <div><div className="font-inter text-[10px] text-white/20 uppercase tracking-widest mb-1">{p.categorie}</div><h3 className="font-bebas text-xl text-white">{p.nom}</h3></div>
              <span className={`w-2 h-2 rounded-full mt-1 ${p.actif ? 'bg-green-400' : 'bg-white/20'}`} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-bebas text-2xl text-rouge">{p.prix}EUR</span>
              <span className="font-inter text-xs text-white/30">Stock : {p.stock}</span>
            </div>
            <button onClick={() => toggleActif(p.id, p.actif)}
              className={`w-full font-inter text-xs uppercase tracking-widest border py-2 transition-colors ${
                p.actif ? 'border-rouge text-rouge hover:bg-rouge hover:text-white' : 'border-white/20 text-white/40 hover:border-white/40 hover:text-white'
              }`}>{p.actif ? 'Desactiver' : 'Activer dans la boutique'}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
