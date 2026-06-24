const champions = [
  { nom: 'Tony Yoka', titres: ['Champion Olympique Rio 2016', 'Champion de France Pro', "Champion d'Europe Pro WBA"], discipline: 'BOXE PRO', nbTitres: 3, pro: true },
  { nom: 'Elie Konki', titres: ['Multiple Champion de France Amateur', "Champion d'Europe Amateur"], discipline: 'BOXE AMATEUR', nbTitres: 5, pro: false },
  { nom: 'Ali Hallab', titres: ['Champion de France Amateur', 'Titre International'], discipline: 'BOXE AMATEUR', nbTitres: 4, pro: false },
  { nom: 'Amina Zidani', titres: ['Championne de France', "Championne d'Europe", 'Vice-championne du Monde'], discipline: 'BOXE PRO', nbTitres: 3, pro: true },
  { nom: 'Jean-Paul Mendy', titres: ['Champion du Monde WBC', 'Champion de France Pro', "Champion d'Europe Pro"], discipline: 'BOXE PRO', nbTitres: 3, pro: true },
  { nom: 'Zakaria Attou', titres: ['Champion du Monde WBC', 'Champion de France', "Champion d'Europe"], discipline: 'BOXE PRO', nbTitres: 3, pro: true },
  { nom: 'Christ Esabe', titres: ['Champion de France MMA', 'Finaliste titre europeen'], discipline: 'MMA', nbTitres: 2, pro: true },
  { nom: 'Paul Omba-Biongolo', titres: ['Champion de France', "Champion d'Europe Amateur"], discipline: 'BOXE AMATEUR', nbTitres: 2, pro: false },
];

export default function Champions() {
  return (
    <section id="champions" className="bg-noir-dark py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-start gap-4 mb-16">
          <div className="accent-line h-16 mt-2" />
          <div>
            <p className="font-inter text-xs uppercase tracking-[0.3em] text-rouge mb-2">Hall of Fame</p>
            <h2 className="section-title">NOS CHAMPIONS</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2px]">
          {champions.map((c) => (
            <div key={c.nom} className="card-noir p-6 relative overflow-hidden group">
              <span className="absolute bottom-2 right-3 font-bebas text-[5rem] text-white/[0.04] leading-none select-none">{c.nbTitres}</span>
              <div className="flex items-center gap-2 mb-4">
                {c.pro ? <span className="bg-rouge text-white font-inter text-[10px] uppercase tracking-widest px-2 py-0.5">Pro</span> : <span className="border border-white/40 text-white/60 font-inter text-[10px] uppercase tracking-widest px-2 py-0.5">Amateur</span>}
                <span className="font-inter text-[10px] text-white/30 uppercase tracking-widest">{c.discipline}</span>
              </div>
              <h3 className="font-bebas text-3xl text-white mb-4 leading-tight group-hover:text-rouge transition-colors duration-300">{c.nom}</h3>
              <ul className="space-y-2">
                {c.titres.map((t) => (<li key={t} className="flex items-start gap-2"><div className="w-[3px] h-3 bg-rouge flex-shrink-0 mt-1" /><span className="font-inter text-xs text-white/50 leading-tight">{t}</span></li>))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
