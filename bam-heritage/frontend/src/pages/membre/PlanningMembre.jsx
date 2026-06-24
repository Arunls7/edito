import { useState, useEffect } from 'react';
import api from '../../lib/api';

const JOURS_ORDER = ['LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI','DIMANCHE'];
const JOURS_FR = { LUNDI:'Lundi', MARDI:'Mardi', MERCREDI:'Mercredi', JEUDI:'Jeudi', VENDREDI:'Vendredi', SAMEDI:'Samedi', DIMANCHE:'Dimanche' };

export default function PlanningMembre() {
  const [cours, setCours] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(null);

  const load = async () => {
    const [c, r] = await Promise.all([
      api.get('/cours').then(({ data }) => data),
      api.get('/cours/mes-reservations').then(({ data }) => data),
    ]);
    setCours(c);
    setReservations(r);
  };

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const reservedIds = new Set(reservations.map((r) => r.coursId));

  const handleReserver = async (coursId) => {
    setReserving(coursId);
    try { await api.post('/cours/reserver', { coursId }); await load(); }
    catch (err) { alert(err.response?.data?.error || 'Erreur'); }
    finally { setReserving(null); }
  };

  const handleAnnuler = async (reservationId) => {
    try { await api.put(`/cours/reservation/${reservationId}/annuler`); await load(); }
    catch (err) { alert(err.response?.data?.error || 'Erreur'); }
  };

  if (loading) return <div className="text-white/40 font-inter text-sm">Chargement...</div>;

  const byJour = JOURS_ORDER.reduce((acc, jour) => {
    const list = cours.filter((c) => c.jour === jour);
    if (list.length) acc[jour] = list;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <p className="font-inter text-xs uppercase tracking-[0.3em] text-rouge mb-1">Reservation</p>
        <h1 className="font-bebas text-4xl text-white">PLANNING HEBDOMADAIRE</h1>
      </div>
      <div className="space-y-4">
        {Object.entries(byJour).map(([jour, list]) => (
          <div key={jour}>
            <p className="font-bebas text-xl text-white/40 mb-2">{JOURS_FR[jour]}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[2px]">
              {list.map((c) => {
                const isReserved = reservedIds.has(c.id);
                const reservation = reservations.find((r) => r.coursId === c.id);
                const placesDispo = c.capacite - (c._count?.reservations || 0);
                return (
                  <div key={c.id} className={`card-noir p-5 ${isReserved ? 'border-l-[3px] border-rouge' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bebas text-lg text-white">{c.nom}</div>
                        <div className="font-inter text-xs text-rouge">{c.heureDebut} — {c.heureFin}</div>
                      </div>
                      <span className="font-inter text-[10px] text-white/30">{placesDispo}/{c.capacite}</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className={`font-inter text-[10px] uppercase tracking-widest border px-2 py-0.5 ${
                        c.discipline === 'BOXE' ? 'border-rouge/40 text-rouge/60' : 'border-blue-400/40 text-blue-400/60'
                      }`}>{c.discipline}</span>
                      {isReserved ? (
                        <button onClick={() => handleAnnuler(reservation.id)} className="font-inter text-xs text-white/40 hover:text-rouge transition-colors uppercase tracking-widest">Annuler</button>
                      ) : (
                        <button onClick={() => handleReserver(c.id)} disabled={reserving === c.id || placesDispo === 0} className="btn-rouge text-xs py-1.5 px-4 disabled:opacity-40">
                          {placesDispo === 0 ? 'Complet' : reserving === c.id ? '...' : 'Reserver'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
