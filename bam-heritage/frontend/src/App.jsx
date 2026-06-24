import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import api from './lib/api';
import Navbar from './components/layout/Navbar';
import Hero from './components/sections/Hero';
import Disciplines from './components/sections/Disciplines';
import Champions from './components/sections/Champions';
import Planning from './components/sections/Planning';
import Footer from './components/sections/Footer';
import PopupBoutique from './components/ui/PopupBoutique';
import PopupBilletterie from './components/ui/PopupBilletterie';
import MembreLayout from './pages/membre/Layout';
import Dashboard from './pages/membre/Dashboard';
import PlanningMembre from './pages/membre/PlanningMembre';
import Profil from './pages/membre/Profil';
import Paiements from './pages/membre/Paiements';
import AdminLayout from './pages/admin/Layout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMembres from './pages/admin/AdminMembres';
import AdminCours from './pages/admin/AdminCours';
import AdminEvenements from './pages/admin/AdminEvenements';
import AdminProduits from './pages/admin/AdminProduits';
import AdminPopup from './pages/admin/AdminPopup';

function HomePage() {
  const [popupBoutique, setPopupBoutique] = useState(false);
  const [popupBilletterie, setPopupBilletterie] = useState(false);

  useEffect(() => {
    const checkPopups = async () => {
      try {
        const [configRes, eventsRes] = await Promise.all([
          api.get('/admin/popup').catch(() => ({ data: { boutiqueActive: false } })),
          api.get('/evenements').catch(() => ({ data: [] })),
        ]);
        if (configRes.data?.boutiqueActive) {
          setPopupBoutique(true);
        } else if (eventsRes.data?.length > 0) {
          setPopupBilletterie(true);
        }
      } catch {}
    };
    const timer = setTimeout(checkPopups, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Disciplines />
        <Champions />
        <Planning />
      </main>
      <Footer />
      {popupBoutique && <PopupBoutique onClose={() => setPopupBoutique(false)} />}
      {popupBilletterie && !popupBoutique && <PopupBilletterie onClose={() => setPopupBilletterie(false)} />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/membre" element={<MembreLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="planning" element={<PlanningMembre />} />
          <Route path="profil" element={<Profil />} />
          <Route path="paiements" element={<Paiements />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="membres" element={<AdminMembres />} />
          <Route path="cours" element={<AdminCours />} />
          <Route path="evenements" element={<AdminEvenements />} />
          <Route path="produits" element={<AdminProduits />} />
          <Route path="popup" element={<AdminPopup />} />
        </Route>
        <Route path="*" element={
          <div className="min-h-screen bg-noir flex items-center justify-center flex-col gap-4">
            <h1 className="font-bebas text-8xl text-white">404</h1>
            <p className="font-inter text-white/40 text-sm">Page introuvable</p>
            <a href="/" className="btn-rouge text-xs py-2 px-6 mt-4">Retour a l'accueil</a>
          </div>
        } />
      </Routes>
    </AuthProvider>
  );
}
