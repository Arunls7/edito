export default function Footer() {
  return (
    <footer id="contact" className="bg-noir-dark border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="font-bebas text-xl text-white tracking-wider mb-1">BAM L'HERITAGE</div>
            <div className="font-inter text-xs text-white/40">Club de Boxe & MMA · Les Mureaux</div>
            <p className="font-bebas text-2xl text-rouge tracking-wider mt-6">"C'EST LA BOXE QUI PARLE"</p>
            <div className="flex gap-4 mt-6">
              {['Instagram','Facebook','YouTube'].map((r) => (
                <a key={r} href="#" className="font-inter text-xs text-white/30 uppercase tracking-widest hover:text-white transition-colors">{r}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bebas text-xl text-white tracking-wider mb-4">CONTACT</h4>
            <div className="space-y-3 font-inter text-sm text-white/50">
              <p>Les Mureaux, Yvelines (78)</p>
              <p><a href="mailto:contact@bam-heritage.fr" className="hover:text-white transition-colors">contact@bam-heritage.fr</a></p>
              <p>Salle omnisports des Mureaux</p>
            </div>
          </div>
          <div>
            <h4 className="font-bebas text-xl text-white tracking-wider mb-4">NAVIGATION</h4>
            <div className="grid grid-cols-2 gap-2">
              {[['Le Club','#club'],['Disciplines','#disciplines'],['Champions','#champions'],['Cours','#cours'],['Espace Membre','/membre/dashboard'],['S\'inscrire','#cours']].map(([label, href]) => (
                <a key={label} href={href} className="font-inter text-xs text-white/40 uppercase tracking-widest hover:text-white transition-colors">{label}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-inter text-xs text-white/20">© {new Date().getFullYear()} BAM l'Heritage · Association Loi 1901 · Club affilie FFB</p>
          <div className="flex gap-6">
            {['Mentions legales','Confidentialite','CGU'].map((item) => (
              <a key={item} href="#" className="font-inter text-xs text-white/20 hover:text-white/50 transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
