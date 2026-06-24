import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../ui/AuthModal';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Le Club', href: '#club' },
    { label: 'Disciplines', href: '#disciplines' },
    { label: 'Champions', href: '#champions' },
    { label: 'Cours', href: '#cours' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-noir-dark shadow-lg shadow-black/50' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-bebas text-2xl text-white tracking-wider">
            BAM<span className="text-rouge"> L'HERITAGE</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}
                className="text-white/70 hover:text-white font-inter text-sm uppercase tracking-widest transition-colors duration-200">
                {link.label}
              </a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to={user.role === 'ADMIN' ? '/admin' : '/membre/dashboard'}
                  className="text-white/70 hover:text-white font-inter text-sm uppercase tracking-widest transition-colors">
                  {user.role === 'ADMIN' ? 'Admin' : 'Mon espace'}
                </Link>
                <button onClick={logout} className="text-white/40 hover:text-white font-inter text-sm transition-colors">Deconnexion</button>
              </div>
            ) : (
              <button onClick={() => setAuthModal(true)} className="text-white/70 hover:text-white font-inter text-sm uppercase tracking-widest mr-2 transition-colors">Connexion</button>
            )}
            <button onClick={() => user ? navigate('/membre/dashboard') : setAuthModal(true)} className="btn-rouge text-xs py-2 px-5">S'inscrire</button>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-2" aria-label="Menu">
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-noir-dark border-t border-white/10 px-4 py-6 flex flex-col gap-5">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                className="text-white font-inter text-sm uppercase tracking-widest">{link.label}</a>
            ))}
            <button onClick={() => { setMenuOpen(false); setAuthModal(true); }} className="btn-rouge text-xs py-3 mt-2">S'inscrire</button>
          </div>
        )}
      </nav>
      {authModal && <AuthModal onClose={() => setAuthModal(false)} />}
    </>
  );
}
