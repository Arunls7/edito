import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function PopupBilletterie({ onClose }) {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const { user } = useAuth();
  useEffect(() => { api.get('/evenements').then(({ data }) => setEvenements(data)).finally(() => setLoading(false)); }, []);
  const handleAchat = async (id) => {
    if (!user) return; setBuying(id);
    try { const { data } = await api.post(`/evenements/${id}/acheter`); window.location.href = data.url; }
    catch (err) { console.error(err); } finally { setBuying(null); }
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-noir-dark border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-rouge" />
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <div><p className="font-inter text-xs uppercase tracking-[0.3em] text-rouge mb-1">Prochains evenements</p><h2 className="font-bebas text-4xl text-white">BILLETTERIE</h2></div>
          <button onClick={onClose} className="text-white/30 hover:text-white font-inter text-sm uppercase tracking-widest">Fermer</button>
        </div>
        <div className="p-8 space-y-4">
          {loading ? <div className="text-center py-12 text-white/30 font-inter text-sm">Chargement...</div> : evenements.length === 0 ? <div className="text-center py-12 text-white/30 font-inter text-sm">Aucun evenement a venir.</div> : evenements.map((e) => (
            <div key={e.id} className="card-noir p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-rouge text-white font-inter text-[10px] uppercase tracking-widest px-2 py-0.5">{new Date(e.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                    <span className="font-inter text-xs text-white/30">{e.placesRestantes} place{e.placesRestantes > 1 ? 's' : ''} restante{e.placesRestantes > 1 ? 's' : ''}</span>
                  </div>
                  <h3 className="font-bebas text-2xl text-white mb-1">{e.nom}</h3>
                  <p className="font-inter text-xs text-white/40">{e.lieu}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bebas text-3xl text-rouge mb-3">{e.prix}€</div>
                  <button onClick={() => handleAchat(e.id)} disabled={buying === e.id || e.placesRestantes === 0} className="btn-rouge text-xs py-2 px-5 disabled:opacity-50">{e.placesRestantes === 0 ? 'Complet' : buying === e.id ? '...' : 'Reserver'}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
