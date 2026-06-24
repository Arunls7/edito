import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function PopupBoutique({ onClose }) {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/produits').then(({ data }) => setProduits(data)).finally(() => setLoading(false));
  }, []);

  const handleAchat = async (produit) => {
    if (!user) return;
    setBuying(produit.id);
    try {
      const { data } = await api.post('/produits/acheter', { produitId: produit.id, quantite: 1 });
      window.location.href = data.url;
    } catch (err) { console.error(err); }
    finally { setBuying(null); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-noir-dark border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-rouge" />
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="font-inter text-xs uppercase tracking-[0.3em] text-rouge mb-1">Boutique officielle</p>
            <h2 className="font-bebas text-4xl text-white">BOUTIQUE BAM</h2>
          </div>
          <button onClick={onClose} className="font-inter text-xs text-white/30 hover:text-white uppercase tracking-widest transition-colors">Fermer</button>
        </div>
        <div className="p-8">
          {loading ? (
            <div className="text-center py-12 text-white/30 font-inter text-sm">Chargement...</div>
          ) : produits.length === 0 ? (
            <div className="text-center py-12 text-white/30 font-inter text-sm">Aucun produit disponible.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[2px]">
              {produits.map((p) => (
                <div key={p.id} className="card-noir p-5">
                  <div className="w-full h-40 bg-noir flex items-center justify-center mb-4">
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.nom} className="w-full h-full object-cover" /> : <span className="font-bebas text-4xl text-white/10">{p.nom[0]}</span>}
                  </div>
                  <div className="font-inter text-xs text-white/30 uppercase tracking-widest mb-1">{p.categorie}</div>
                  <h3 className="font-bebas text-xl text-white mb-1">{p.nom}</h3>
                  <p className="font-inter text-xs text-white/50 mb-4">{p.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bebas text-2xl text-rouge">{p.prix}EUR</span>
                    <button onClick={() => handleAchat(p)} disabled={buying === p.id || p.stock === 0} className="btn-rouge text-xs py-2 px-4 disabled:opacity-50">
                      {p.stock === 0 ? 'Rupture' : buying === p.id ? '...' : 'Acheter'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
