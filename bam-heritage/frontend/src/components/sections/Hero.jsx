const CHAMPIONS_TICKER = ['TONY YOKA', 'ALI HALLAB', 'ELIE KONKI', 'AMINA ZIDANI', 'JEAN-PAUL MENDY', 'ZAKARIA ATTOU', 'CHRIST ESABE', 'PAUL OMBA-BIONGOLO'];

export default function Hero() {
  const tickerText = [...CHAMPIONS_TICKER, ...CHAMPIONS_TICKER].join('  ·  ');
  return (
    <section className="relative min-h-screen bg-noir-dark flex flex-col justify-center overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-rouge" />
      <div className="relative max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24">
        <p className="font-inter text-xs uppercase tracking-[0.3em] text-rouge mb-6">Les Mureaux · Yvelines · Club affilie FFB</p>
        <h1 className="font-bebas leading-none mb-8">
          <span className="block text-[16vw] md:text-[13vw] text-white">C'EST LA</span>
          <span className="block text-[20vw] md:text-[17vw] text-rouge leading-[0.85]">BOXE</span>
          <span className="block text-[13vw] md:text-[11vw] leading-none" style={{ WebkitTextStroke: '2px #ffffff', color: 'transparent' }}>QUI PARLE</span>
        </h1>
        <div className="flex flex-wrap gap-8 md:gap-16 mb-12 mt-4">
          {[{ value: '36', label: 'Titres France Amateur' }, { value: '10', label: 'Titres France Pro' }, { value: '+40', label: "Ans d'histoire" }].map((stat) => (
            <div key={stat.label} className="flex items-start gap-3">
              <div className="accent-line h-10 mt-1" />
              <div>
                <div className="font-bebas text-4xl md:text-5xl text-white">{stat.value}</div>
                <div className="font-inter text-xs text-white/50 uppercase tracking-widest">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          <a href="#cours" className="btn-rouge">Rejoindre le club</a>
          <a href="#cours" className="btn-outline">Voir le planning</a>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-rouge overflow-hidden h-10 flex items-center">
        <div className="ticker-track">
          <span className="font-bebas text-white tracking-[0.2em] text-sm px-8">{tickerText}</span>
          <span className="font-bebas text-white tracking-[0.2em] text-sm px-8">{tickerText}</span>
        </div>
      </div>
    </section>
  );
}
