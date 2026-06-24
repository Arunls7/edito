import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', nom: '', prenom: '', telephone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = mode === 'login' ? await login(form.email, form.password) : await register(form);
      onClose();
      navigate(user.role === 'ADMIN' ? '/admin' : '/membre/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-noir border border-white/10 px-4 py-2.5 text-white font-inter text-sm focus:border-rouge outline-none transition-colors";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="bg-noir-dark border border-white/10 w-full max-w-md p-8 relative">
        <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-rouge" />
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white text-xl transition-colors">x</button>
        <p className="font-inter text-xs uppercase tracking-[0.3em] text-rouge mb-2">{mode === 'login' ? 'Connexion' : 'Inscription'}</p>
        <h2 className="font-bebas text-4xl text-white mb-6">{mode === 'login' ? 'MON ESPACE' : 'REJOINDRE LE CLUB'}</h2>
        <div className="flex border border-white/10 mb-6">
          {['login','register'].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2.5 font-inter text-xs uppercase tracking-widest transition-colors ${
                mode === m ? 'bg-rouge text-white' : 'text-white/40 hover:text-white'
              }`}>
              {m === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-inter text-xs text-white/40 uppercase tracking-widest mb-1.5">Prenom</label>
                <input name="prenom" value={form.prenom} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className="block font-inter text-xs text-white/40 uppercase tracking-widest mb-1.5">Nom</label>
                <input name="nom" value={form.nom} onChange={handleChange} required className={inputClass} />
              </div>
            </div>
          )}
          <div>
            <label className="block font-inter text-xs text-white/40 uppercase tracking-widest mb-1.5">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block font-inter text-xs text-white/40 uppercase tracking-widest mb-1.5">Mot de passe</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required className={inputClass} />
          </div>
          {mode === 'register' && (
            <div>
              <label className="block font-inter text-xs text-white/40 uppercase tracking-widest mb-1.5">Telephone (optionnel)</label>
              <input name="telephone" value={form.telephone} onChange={handleChange} className={inputClass} />
            </div>
          )}
          {error && <p className="font-inter text-xs text-rouge border border-rouge/30 bg-rouge/10 px-4 py-3">{error}</p>}
          <button type="submit" disabled={loading} className="btn-rouge w-full text-sm py-3 mt-2 disabled:opacity-50">
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Creer mon compte'}
          </button>
        </form>
      </div>
    </div>
  );
}
