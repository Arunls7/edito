import { useState, useEffect } from 'react';
import api from '../../lib/api';
const STATUT_COLOR = { ACTIF: 'text-green-400', EXPIRE: 'text-rouge', EN_ATTENTE: 'text-yellow-400' };
const TYPE_FR = { MENSUEL: 'Mensuel', ANNUEL: 'Annuel' };
export default function Paiements() {
  const [abonnements, setAbonnements] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = new URLSearchParams(window.location.search);
  useEffect(() => { api.get('/membre/paiements').then(({ data }) => setAbonnements(data)).finally(() => setLoading(false)); }, []);
  return (
    <div className="max-w-2xl">
      <div className="mb-8"><p className="font-inter text-xs uppercase tracking-[0.3em] text-rouge mb-1">Historique</p><h1 className="font-bebas text-4xl text-white">PAIEMENTS</h1></div>
      {searchParams.get('success') === 'true' && <div className="bg-green-900/20 border border-green-500/30 text-green-400 font-inter text-sm px-4 py-3 mb-6">Paiement confirme ! Merci.</div>}
      <div className="card-noir p-6 mb-6 flex items-center justify-between">
        <div><p className="font-bebas text-xl text-white">RENOUVELER MON ABONNEMENT</p><p className="font-inter text-xs text-white/40">Paiement securise via HelloAsso</p></div>
        <a href="https://www.helloasso.com/" target="_blank" rel="noopener noreferrer" className="btn-rouge text-xs py-2.5 px-6">HelloAsso</a>
      </div>
      <div className="card-noir p-6">
        <p className="font-inter text-xs uppercase tracking-widest text-white/30 mb-5">Historique des cotisations</p>
        {loading ? <p className="font-inter text-sm text-white/30">Chargement...</p> : abonnements.length === 0 ? <p className="font-inter text-sm text-white/30">Aucun abonnement enregistre.</p> : (
          <div className="space-y-3">{abonnements.map((a) => (<div key={a.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"><div><div className="font-inter text-sm text-white">{TYPE_FR[a.type]}</div><div className="font-inter text-xs text-white/30">{a.startDate && `Du ${new Date(a.startDate).toLocaleDateString('fr-FR')}`}{a.endDate && ` au ${new Date(a.endDate).toLocaleDateString('fr-FR')}`}</div></div><div className="text-right"><div className={`font-inter text-xs font-semibold ${STATUT_COLOR[a.statut]}`}>{a.statut}</div>{a.montant && <div className="font-bebas text-lg text-white/60">{a.montant}€</div>}</div></div>))}
          </div>
        )}
      </div>
    </div>
  );
}
