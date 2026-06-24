import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../ui/AuthModal';

const JOURS_ORDER = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'];
const JOURS_FR = { LUNDI: 'Lundi', MARDI: 'Mardi', MERCREDI: 'Mercredi', JEUDI: 'Jeudi', VENDREDI: 'Vendredi', SAMEDI: 'Samedi', DIMANCHE: 'Dimanche' };
const FALLBACK_COURS = [
  { id: '1', nom: 'Boxe Loisir', discipline: 'BOXE', niveau: 'LOISIR', jour: 'LUNDI', heureDebut: '18:00', heureFin: '19:30', capacite: 20, coach: { prenom: 'Karim', nom: 'B.' } },
  { id: '2', nom: 'Boxe Competition', discipline: 'BOXE', niveau: 'COMPETITION', jour: 'MARDI', heureDebut: '19:00', heureFin: '21:00', capacite: 15, coach: null },
  { id: '3', nom: 'MMA Initiation', discipline: 'MMA', niveau: 'LOISIR', jour: 'MERCREDI', heureDebut: '18:30', heureFin: '20:00', capacite: 16, coach: null },
  { id: '4', nom: 'Boxe Jeunes', discipline: 'BOXE', niveau: 'JEUNES', jour: 'MERCREDI', heureDebut: '17:00', heureFin: '18:30', capacite: 20, coach: null },
  { id: '5', nom: 'Boxe Loisir', discipline: 'BOXE', niveau: 'LOISIR', jour: 'JEUDI', heureDebut: '18:00', heureFin: '19:30', capacite: 20, coach: null },
  { id: '6', nom: 'MMA Avance', discipline: 'MMA', niveau: 'COMPETITION', jour: 'JEUDI', heureDebut: '20:00', heureFin: '21:30', capacite: 12, coach: null },
  { id: '7', nom: 'Boxe Loisir', discipline: 'BOXE', niveau: 'LOISIR', jour: 'VENDREDI', heureDebut: '18:00', heureFin: '19:30', capacite: 20, coach: null },
  { id: '8', nom: 'Sparring Competition', discipline: 'BOXE', niveau: 'COMPETITION', jour: 'VENDREDI', heureDebut: '19:30', heureFin: '21:00', capacite: 12, coach: null },
  { id: '9', nom: 'Boxe Tout Niveau', discipline: 'BOXE', niveau: 'LOISIR', jour: 'SAMEDI', heureDebut: '10:00', heureFin: '12:00', capacite: 25, coach: null },
  { id: '10', nom: 'MMA Grappling', discipline: 'MMA', niveau: 'LOISIR', jour: 'SAMEDI', heureDebut: '12:00', heureFin: '13:30', capacite: 16, coach: null },
];
const NIVEAU_COLORS = { LOISIR: 'border-white/20 text-white/50', COMPETITION: 'border-rouge text-rouge', JEUNES: 'border-blue-400/40 text-blue-400/60' };
const NIVEAU_FR = { LOISIR: 'Loisir', COMPETITION: 'Competition', JEUNES: 'Jeunes' };

export default function Planning() {
  const [cours, setCours] = useState([]);
  const [filter, setFilter] = useState('TOUS');
  const [showAuth, setShowAuth] = useState(false);
  const { user } = useAuth();
  useEffect(() => { api.get('/cours').then(({ data }) => setCours(data)).catch(() => setCours(FALLBACK_COURS)); }, []);
  const filtered = filter === 'TOUS' ? cours : cours.filter((c) => c.discipline === filter);
  const byJour = JOURS_ORDER.reduce((acc, jour) => { const list = filtered.filter((c) => c.jour === jour); if (list.length) acc[jour] = list; return acc; }, {});
  return (
    <>
      <section id="cours" className="bg-noir py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="flex items-start gap-4"><div className="accent-line h-16 mt-2" /><div><p className="font-inter text-xs uppercase tracking-[0.3em] text-rouge mb-2">Planning hebdomadaire</p><h2 className="section-title">COURS &amp; CRENEAUX</h2></div></div>
            <div className="flex gap-2">{['TOUS', 'BOXE', 'MMA'].map((f) => (<button key={f} onClick={() => setFilter(f)} className={`font-inter text-xs uppercase tracking-widest px-5 py-2 border transition-colors duration-200 ${filter === f ? 'bg-rouge border-rouge text-white' : 'border-white/20 text-white/50 hover:border-white/40 hover:text-white'}`}>{f}</button>))}</div>
          </div>
          <div className="space-y-[2px]">
            {Object.entries(byJour).map(([jour, coursList]) => (
              <div key={jour} className="grid grid-cols-[120px_1fr] gap-[2px]">
                <div className="card-noir flex items-center justify-center py-6"><span className="font-bebas text-2xl text-white/80 tracking-wider">{JOURS_FR[jour]}</span></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[2px]">
                  {coursList.map((c) => (
                    <div key={c.id} className="card-noir p-5 hover:border-rouge/30 transition-colors duration-200">
                      <div className="flex items-start justify-between mb-3">
                        <span className="font-bebas text-xl text-white">{c.nom}</span>
                        <span className={`font-inter text-[10px] uppercase tracking-widest border px-2 py-0.5 ${NIVEAU_COLORS[c.niveau]}`}>{NIVEAU_FR[c.niveau]}</span>
                      </div>
                      <div className="font-inter text-sm text-rouge font-semibold mb-2">{c.heureDebut} — {c.heureFin}</div>
                      {c.coach && <p className="font-inter text-xs text-white/30 mb-3">Coach : {c.coach.prenom} {c.coach.nom}</p>}
                      <div className="flex items-center justify-between">
                        <span className="font-inter text-[10px] text-white/20 uppercase tracking-widest">Capacite : {c.capacite}</span>
                        <span className={`w-2 h-2 rounded-full ${c.discipline === 'BOXE' ? 'bg-rouge' : 'bg-blue-400/60'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 p-8 bg-rouge flex flex-col md:flex-row items-center justify-between gap-6">
            <div><h3 className="font-bebas text-3xl text-white">PRET A VOUS INSCRIRE ?</h3><p className="font-inter text-sm text-white/80">Rejoignez le BAM Heritage. Adhesion via HelloAsso.</p></div>
            <button onClick={() => !user ? setShowAuth(true) : window.open('https://www.helloasso.com/', '_blank')} className="bg-white text-rouge font-inter font-semibold text-sm uppercase tracking-widest px-8 py-3 hover:bg-white/90 transition-colors flex-shrink-0">S'inscrire maintenant</button>
          </div>
        </div>
      </section>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
