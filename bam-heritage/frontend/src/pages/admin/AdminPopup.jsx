import { useState, useEffect } from 'react';
import api from '../../lib/api';
export default function AdminPopup() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => { api.get('/admin/popup').then(({ data }) => setConfig(data)).finally(() => setLoading(false)); }, []);
  const toggle = async (key) => {
    setSaving(true);
    try { const { data } = await api.put('/admin/popup', { [key]: !config[key] }); setConfig(data); }
    finally { setSaving(false); }
  };
  if (loading) return <div className="text-white/30 font-inter text-sm">Chargement...</div>;
  return (
    <div className="max-w-lg">
      <div className="mb-8"><p className="font-inter text-xs uppercase tracking-[0.3em] text-rouge mb-1">Configuration</p><h1 className="font-bebas text-4xl text-white">GESTION DES POPUPS</h1></div>
      <div className="space-y-4">
        <div className="card-noir p-6 flex items-center justify-between">
          <div><h2 className="font-bebas text-2xl text-white mb-1">POPUP BOUTIQUE</h2><p className="font-inter text-xs text-white/40">Affiche la boutique sur le site vitrine.</p><p className="font-inter text-xs text-white/20 mt-1">Statut : <span className={config.boutiqueActive ? 'text-green-400' : 'text-white/20'}>{config.boutiqueActive ? 'Active' : 'Inactive'}</span></p></div>
          <button onClick={() => toggle('boutiqueActive')} disabled={saving} className={`relative w-14 h-7 transition-colors duration-300 focus:outline-none ${config.boutiqueActive ? 'bg-rouge' : 'bg-white/10'}`}><span className={`absolute top-1 w-5 h-5 bg-white transition-all duration-300 ${config.boutiqueActive ? 'left-8' : 'left-1'}`} /></button>
        </div>
        <div className="card-noir p-6 flex items-center justify-between">
          <div><h2 className="font-bebas text-2xl text-white mb-1">POPUP BILLETTERIE</h2><p className="font-inter text-xs text-white/40">Active automatiquement quand un evenement actif existe.</p></div>
          <div className="font-inter text-xs text-white/20 uppercase tracking-widest">Auto</div>
        </div>
      </div>
    </div>
  );
}
