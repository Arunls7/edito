import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
const STATUT_COLOR = { ACTIF: 'text-green-400', EXPIRE: 'text-rouge', EN_ATTENTE: 'text-yellow-400' };
const JOUR_FR = { LUNDI: 'Lun', MARDI: 'Mar', MERCREDI: 'Mer', JEUDI: 'Jeu', VENDREDI: 'Ven', SAMEDI: 'Sam', DIMANCHE: 'Dim' };
export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/membre/dashboard').then(({ data }) => setData(data)).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="text-white/40 font-inter text-sm">Chargement...</div>;
  const abonnement = data?.abonnement;
  const reservations = data?.prochainsCoursRéservés || [];
  return (
    <div className="max-w-4xl">
      <div className="mb-8"><p className="font-inter text-xs uppercase tracking-[0.3em] text-rouge mb-1">Bienvenue</p><h1 className="font-bebas text-4xl text-white">{user?.prenom?.toUpperCase()} {user?.nom?.toUpperCase()}</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] mb-8">
        <div className="card-noir p-6">
          <p className="font-inter text-xs uppercase tracking-widest text-white/30 mb-3">Abonnement</p>
          {abonnement ? (<><div className="font-bebas text-3xl text-white mb-1">{abonnement.type}</div><div className={`font-inter text-sm font-semibold ${STATUT_COLOR[abonnement.statut]}`}>{abonnement.statut}</div></>) : (<div><div className="font-bebas text-2xl text-white/30 mb-2">Aucun abonnement</div><a href="https://www.helloasso.com/" target="_blank" rel="noopener noreferrer" className="btn-rouge text-xs py-2 px-4 inline-block">S'abonner via HelloAsso</a></div>)}
        </div>
        <div className="card-noir p-6"><p className="font-inter text-xs uppercase tracking-widest text-white/30 mb-3">Cours reserves</p><div className="font-bebas text-5xl text-rouge">{reservations.length}</div></div>
      </div>
      <div className="card-noir p-6">
        <p className="font-inter text-xs uppercase tracking-widest text-white/30 mb-5">Mes prochains cours</p>
        {reservations.length === 0 ? <p className="font-inter text-sm text-white/30">Aucun cours reserve.</p> : (
          <div className="space-y-3">{reservations.map((r) => (<div key={r.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"><div className="flex items-center gap-4"><span className="font-bebas text-lg text-rouge w-10">{JOUR_FR[r.cours.jour]}</span><div><div className="font-inter text-sm text-white">{r.cours.nom}</div><div className="font-inter text-xs text-white/30">{r.cours.heureDebut} — {r.cours.heureFin}</div></div></div><span className={`font-inter text-[10px] uppercase tracking-widest border px-2 py-0.5 ${r.cours.discipline === 'BOXE' ? 'border-rouge text-rouge' : 'border-blue-400/40 text-blue-400/60'}`}>{r.cours.discipline}</span></div>))}</div>
        )}
      </div>
    </div>
  );
}
