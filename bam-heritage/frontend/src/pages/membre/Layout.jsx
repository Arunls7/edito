import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
const navItems = [{ to: '/membre/dashboard', label: 'Tableau de bord' }, { to: '/membre/planning', label: 'Planning' }, { to: '/membre/profil', label: 'Mon profil' }, { to: '/membre/paiements', label: 'Paiements' }];
export default function MembreLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !user) navigate('/'); }, [user, loading, navigate]);
  if (loading) return <div className="min-h-screen bg-noir flex items-center justify-center text-white font-inter">Chargement...</div>;
  if (!user) return null;
  return (
    <div className="min-h-screen bg-noir flex flex-col">
      <div className="bg-noir-dark border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-bebas text-xl text-white tracking-wider">BAM <span className="text-rouge">L'HERITAGE</span></a>
        <div className="flex items-center gap-6">
          <span className="font-inter text-xs text-white/40">{user.prenom} {user.nom}</span>
          <button onClick={() => { logout(); navigate('/'); }} className="font-inter text-xs text-white/30 hover:text-white uppercase tracking-widest transition-colors">Deconnexion</button>
        </div>
      </div>
      <div className="flex flex-1">
        <aside className="w-56 bg-noir-dark border-r border-white/10 flex flex-col p-6 gap-1">
          <p className="font-inter text-[10px] text-white/20 uppercase tracking-widest mb-4">Espace Membre</p>
          {navItems.map((item) => (<NavLink key={item.to} to={item.to} className={({ isActive }) => `font-inter text-sm px-3 py-2.5 transition-colors ${isActive ? 'text-white bg-rouge/10 border-l-[3px] border-rouge pl-[calc(0.75rem-3px)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>{item.label}</NavLink>))}
        </aside>
        <main className="flex-1 p-8 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}
