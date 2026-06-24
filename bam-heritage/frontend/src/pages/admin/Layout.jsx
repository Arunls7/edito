import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
const navItems = [{ to: '/admin', label: 'Tableau de bord', exact: true }, { to: '/admin/membres', label: 'Membres' }, { to: '/admin/cours', label: 'Cours' }, { to: '/admin/evenements', label: 'Evenements' }, { to: '/admin/produits', label: 'Produits' }, { to: '/admin/popup', label: 'Popups' }];
export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && (!user || user.role !== 'ADMIN')) navigate('/'); }, [user, loading, navigate]);
  if (loading) return <div className="min-h-screen bg-noir flex items-center justify-center text-white font-inter">Chargement...</div>;
  if (!user || user.role !== 'ADMIN') return null;
  return (
    <div className="min-h-screen bg-noir flex flex-col">
      <div className="bg-noir-dark border-b border-rouge/30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3"><a href="/" className="font-bebas text-xl text-white tracking-wider">BAM <span className="text-rouge">L'HERITAGE</span></a><span className="bg-rouge text-white font-inter text-[10px] uppercase tracking-widest px-2 py-0.5">Admin</span></div>
        <button onClick={() => { logout(); navigate('/'); }} className="font-inter text-xs text-white/30 hover:text-white uppercase tracking-widest transition-colors">Deconnexion</button>
      </div>
      <div className="flex flex-1">
        <aside className="w-56 bg-noir-dark border-r border-white/10 flex flex-col p-6 gap-1">
          <p className="font-inter text-[10px] text-white/20 uppercase tracking-widest mb-4">Administration</p>
          {navItems.map((item) => (<NavLink key={item.to} to={item.to} end={item.exact} className={({ isActive }) => `font-inter text-sm px-3 py-2.5 transition-colors ${isActive ? 'text-white bg-rouge/10 border-l-[3px] border-rouge pl-[calc(0.75rem-3px)]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>{item.label}</NavLink>))}
        </aside>
        <main className="flex-1 p-8 overflow-y-auto"><Outlet /></main>
      </div>
    </div>
  );
}
