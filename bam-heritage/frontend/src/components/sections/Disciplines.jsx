const disciplines = [
  { id: 'boxe', nom: 'Boxe Anglaise', tag: 'Discipline historique', description: "La boxe anglaise est l'ADN du BAM Heritage depuis plus de 40 ans. Technique, puissance, rigueur.", niveaux: ['Loisir & Fitness', 'Competition Amateur', 'Competition Pro', 'Jeunes (8-17 ans)'], detail: 'Boxe debout · Travail technique · Sparring · Gala' },
  { id: 'mma', nom: 'MMA', tag: 'Mixed Martial Arts', description: "L'art de tous les combats. Striking, grappling, ground-and-pound.", niveaux: ['Initiation MMA', 'Grappling / Lutte', 'Competition MMA', 'Self-defense'], detail: 'Striking · Wrestling · Soumission · Clinch' },
];

export default function Disciplines() {
  return (
    <section id="disciplines" className="bg-noir py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-start gap-4 mb-16">
          <div className="accent-line h-16 mt-2" />
          <div>
            <p className="font-inter text-xs uppercase tracking-[0.3em] text-rouge mb-2">Nos pratiques</p>
            <h2 className="section-title">DISCIPLINES</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-[2px]">
          {disciplines.map((disc, i) => (
            <div key={disc.id} className="card-noir p-8 md:p-12 relative">
              <span className="absolute top-4 right-6 font-bebas text-[8rem] text-white/[0.03] leading-none select-none">0{i + 1}</span>
              <span className="inline-block font-inter text-xs uppercase tracking-widest text-rouge border border-rouge px-3 py-1 mb-6">{disc.tag}</span>
              <h3 className="font-bebas text-5xl md:text-6xl text-white mb-4">{disc.nom}</h3>
              <p className="font-inter text-white/60 text-sm leading-relaxed mb-8">{disc.description}</p>
              <div className="mb-8">
                <p className="font-inter text-xs uppercase tracking-widest text-white/30 mb-3">Niveaux</p>
                <div className="grid grid-cols-2 gap-2">
                  {disc.niveaux.map((n) => (<div key={n} className="flex items-center gap-2"><div className="w-1 h-1 bg-rouge flex-shrink-0" /><span className="font-inter text-xs text-white/70">{n}</span></div>))}
                </div>
              </div>
              <p className="font-inter text-xs text-white/30 uppercase tracking-widest border-t border-white/10 pt-6 mb-8">{disc.detail}</p>
              <a href="#cours" className="btn-rouge text-xs inline-block">Voir les creneaux</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
