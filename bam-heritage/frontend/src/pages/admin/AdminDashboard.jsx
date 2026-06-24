import { useState, useEffect } from 'react';
import api from '../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data));
  }, []);

  const cards = stats ? [
    { label: 'Total Membres', value: stats.totalMembres, color: 'text-white' },
    { label: 'Abonnements Actifs', value: stats.abonnementsActifs, color: 'text-green-400' },
    { label: "Reservations Aujourd'hui", value: stats.reservationsAujourdhui, color: 'text-rouge' },
  ] : [];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <p className="font-inter text-xs uppercase tracking-[0.3em] text-rouge mb-1">Administration</p>
        <h1 className="font-bebas text-4xl text-white">TABLEAU DE BORD</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px] mb-8">
        {cards.map((card) => (
          <div key={card.label} className="card-noir p-6">
            <p className="font-inter text-xs uppercase tracking-widest text-white/30 mb-2">{card.label}</p>
            <div className={`font-bebas text-5xl ${card.color}`}>{card.value ?? '—'}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px]">
        {[
          { to: '/admin/membres', label: 'Gerer les membres', desc: 'Liste, abonnements, recherche' },
          { to: '/admin/cours', label: 'Gerer les cours', desc: 'CRUD creneaux, coachs, capacite' },
          { to: '/admin/evenements', label: 'Gerer les evenements', desc: 'Billetterie Stripe' },
          { to: '/admin/popup', label: 'Configurer les popups', desc: 'Boutique & billetterie' },
        ].map((item) => (
          <a key={item.to} href={item.to} className="card-noir p-6 hover:border-rouge/30 transition-colors group">
            <div className="font-bebas text-2xl text-white group-hover:text-rouge transition-colors">{item.label}</div>
            <p className="font-inter text-xs text-white/30 mt-1">{item.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
