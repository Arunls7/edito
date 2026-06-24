import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
export default function AdminMembres() {
  const [membres, setMembres] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/admin/membres', { params: { search, page, limit: 20 } }); setMembres(data.membres); setTotal(data.total); }
    finally { setLoading(false); }
  }, [search, page]);
  useEffect(() => { load(); }, [load]);
  const STATUT_COLOR = { ACTIF: 'text-green-400', EXPIRE: 'text-rouge', EN_ATTENTE: 'text-yellow-400' };
  return (
    <div>
      <div className="flex items-center justify-between mb-8"><div><p className="font-inter text-xs uppercase tracking-[0.3em] text-rouge mb-1">Gestion</p><h1 className="font-bebas text-4xl text-white">MEMBRES <span className="text-white/30 text-3xl">({total})</span></h1></div></div>
      <div className="mb-6"><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher..." className="w-full max-w-md bg-noir-card border border-white/10 px-4 py-2.5 text-white font-inter text-sm focus:border-rouge outline-none transition-colors placeholder:text-white/20" /></div>
      <div className="card-noir overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-white/10">{['Membre', 'Email', 'Role', 'Abonnement', 'Inscription'].map((h) => (<th key={h} className="text-left px-4 py-3 font-inter text-[10px] uppercase tracking-widest text-white/30">{h}</th>))}</tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="text-center py-8 font-inter text-sm text-white/30">Chargement...</td></tr> : membres.map((m) => {
              const ab = m.abonnements?.[0];
              return (<tr key={m.id} className="border-b border-white/5 hover:bg-white/3 transition-colors"><td className="px-4 py-3 font-inter text-sm text-white">{m.prenom} {m.nom}</td><td className="px-4 py-3 font-inter text-xs text-white/50">{m.email}</td><td className="px-4 py-3"><span className={`font-inter text-[10px] uppercase tracking-widest border px-2 py-0.5 ${m.role === 'ADMIN' ? 'border-rouge text-rouge' : 'border-white/20 text-white/40'}`}>{m.role}</span></td><td className="px-4 py-3">{ab ? <span className={`font-inter text-xs font-semibold ${STATUT_COLOR[ab.statut]}`}>{ab.type} · {ab.statut}</span> : <span className="font-inter text-xs text-white/20">Aucun</span>}</td><td className="px-4 py-3 font-inter text-xs text-white/30">{new Date(m.createdAt).toLocaleDateString('fr-FR')}</td></tr>);
            })}
          </tbody>
        </table>
      </div>
      {total > 20 && <div className="flex justify-center gap-2 mt-6">{Array.from({ length: Math.ceil(total / 20) }, (_, i) => i + 1).map((p) => (<button key={p} onClick={() => setPage(p)} className={`w-8 h-8 font-inter text-xs transition-colors ${p === page ? 'bg-rouge text-white' : 'border border-white/10 text-white/40 hover:text-white'}`}>{p}</button>))}</div>}
    </div>
  );
}
