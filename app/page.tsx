import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ArrowRight, Sparkles, Scissors, Captions, Zap, Film, Mic, Layers } from "lucide-react";
import { hasClerkPublishableConfig } from "@/lib/clerk-config";

export default function Home() {
  const hasClerkConfig = hasClerkPublishableConfig();

  return (
    <div className="relative min-h-screen bg-[#080809] text-[#f5f5f7] overflow-x-hidden">
      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      {/* Top glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[500px] bg-gradient-to-b from-[#ff7a4510] to-transparent" />

      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-[#ff7a45] to-[#c44e2a]" />
            <span className="text-base font-semibold tracking-tight">Edito</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a href="#features" className="hover:text-white/90 transition">Features</a>
            <a href="#workflow" className="hover:text-white/90 transition">Workflow</a>
            <a href="#pricing" className="hover:text-white/90 transition">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            {hasClerkConfig ? (
              <>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="text-sm text-white/50 hover:text-white/90 transition">
                      Se connecter
                    </button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <button className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-medium text-[#080809] hover:bg-white transition">
                      Commencer
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard" className="text-sm text-white/50 hover:text-white/90 transition">
                    Dashboard
                  </Link>
                  <UserButton />
                </SignedIn>
              </>
            ) : (
              <Link href="/dashboard" className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-medium text-[#080809] hover:bg-white transition">
                Ouvrir l&apos;app
              </Link>
            )}
          </div>
        </nav>

        {/* Hero */}
        <section className="mx-auto max-w-5xl px-8 pt-28 pb-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-xs text-white/50 mb-10">
            <Sparkles className="h-3 w-3 text-[#ff7a45]" />
            Accès anticipé — gratuit pendant le beta
          </div>

          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
            Décris l&apos;édit.
            <br />
            <span className="text-white/30">L&apos;agent s&apos;en charge.</span>
          </h1>

          <p className="mt-6 text-lg text-white/40 max-w-lg mx-auto leading-relaxed">
            Edito transforme tes instructions en langage naturel en montage vidéo.
            Silences, captions, découpes — exécutés en secondes.
          </p>

          <div className="mt-10 flex items-center justify-center gap-3">
            {hasClerkConfig ? (
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="group inline-flex items-center gap-2 rounded-full bg-[#ff7a45] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#ff6a35] transition">
                    Essayer maintenant
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
                  </button>
                </SignInButton>
              </SignedOut>
            ) : null}
            <SignedIn>
              <Link href="/dashboard" className="group inline-flex items-center gap-2 rounded-full bg-[#ff7a45] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#ff6a35] transition">
                Aller au dashboard
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
              </Link>
            </SignedIn>
            {!hasClerkConfig && (
              <Link href="/dashboard" className="group inline-flex items-center gap-2 rounded-full bg-[#ff7a45] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#ff6a35] transition">
                Essayer maintenant
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
              </Link>
            )}
            <a href="#features" className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] px-6 py-2.5 text-sm text-white/50 hover:text-white/80 hover:border-white/20 transition">
              Voir les features
            </a>
          </div>

          {/* Mock editor UI */}
          <div className="mt-20 relative mx-auto max-w-4xl rounded-xl border border-white/[0.08] bg-[#0f0f11] overflow-hidden shadow-2xl shadow-black/60">
            {/* Top bar */}
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-white/10" />
                <div className="h-3 w-3 rounded-full bg-white/10" />
                <div className="h-3 w-3 rounded-full bg-white/10" />
              </div>
              <div className="mx-auto text-xs text-white/20 font-mono">interview-finale.mp4 — Edito</div>
            </div>
            <div className="flex h-64">
              {/* Video area */}
              <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-[#111113] to-[#0a0a0c]">
                <div className="flex flex-col items-center gap-3 opacity-30">
                  <Film className="h-10 w-10" />
                  <span className="text-xs font-mono">00:02:34</span>
                </div>
              </div>
              {/* Chat panel */}
              <div className="w-72 border-l border-white/[0.06] bg-[#121214] flex flex-col">
                <div className="border-b border-white/[0.06] px-4 py-3 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-[#ff7a45]" />
                  <span className="text-xs font-semibold">Director</span>
                  <span className="ml-auto text-[10px] text-[#5ee2a0] bg-[#5ee2a0]/10 border border-[#5ee2a0]/20 rounded-full px-2 py-0.5">Ready</span>
                </div>
                <div className="flex-1 px-4 py-4 space-y-3">
                  <div className="text-[11px] text-white/30">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-1">You</div>
                    Supprime les silences et ajoute des captions bold
                  </div>
                  <div className="text-[11px] text-white/50">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-1">Director</div>
                    Détection de 12 silences…
                  </div>
                  <div className="rounded-lg border border-white/[0.08] bg-black/30 p-2.5 text-[10px] font-mono text-[#5ee2a0]">
                    ✓ remove_silences<br />
                    ✓ add_captions (bold)
                  </div>
                </div>
              </div>
            </div>
            {/* Timeline */}
            <div className="border-t border-white/[0.06] px-4 py-3 bg-[#0d0d0f]">
              <div className="flex gap-1 h-6">
                {[40, 15, 25, 10, 35, 20, 30, 18, 28].map((w, i) => (
                  <div
                    key={i}
                    className="rounded-sm bg-[#ff7a45]/60 h-full"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
            </div>
            {/* Gradient overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#080809]/80 to-transparent pointer-events-none" />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-5xl px-8 py-24">
            <div className="text-center mb-16">
              <div className="text-xs font-semibold uppercase tracking-widest text-[#ff7a45] mb-4">Features</div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Un agent IA, tous les outils
              </h2>
              <p className="mt-4 text-white/40 max-w-md mx-auto">
                Tout ce qu&apos;un éditeur professionnel ferait en heures, Director l&apos;exécute en secondes.
              </p>
            </div>

            {/* Bento grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Big card */}
              <div className="md:col-span-2 rounded-xl border border-white/[0.08] bg-[#0f0f11] p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ff7a45]/5 to-transparent" />
                <Scissors className="h-6 w-6 text-[#ff7a45] mb-4" />
                <h3 className="text-lg font-semibold mb-2">Suppression des silences</h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  Détection VAD automatique. Tous les temps morts supprimés, avec une marge configurable pour éviter les coupures brutales.
                </p>
                <div className="mt-6 flex gap-1">
                  {[1,0,1,1,0,1,0,1,1,0,1,1,0,0,1,0,1,1].map((v, i) => (
                    <div key={i} className="flex-1 h-8 rounded-sm" style={{ background: v ? "rgba(255,122,69,0.5)" : "rgba(255,255,255,0.05)" }} />
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#0f0f11] p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6aa8ff]/5 to-transparent" />
                <Captions className="h-6 w-6 text-[#6aa8ff] mb-4" />
                <h3 className="text-lg font-semibold mb-2">Captions auto</h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  Transcription Deepgram, styles minimal · bold · kinetic.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#0f0f11] p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#5ee2a0]/5 to-transparent" />
                <Mic className="h-6 w-6 text-[#5ee2a0] mb-4" />
                <h3 className="text-lg font-semibold mb-2">Transcription instantanée</h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  Deepgram Nova-3. Détection automatique de la langue.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#0f0f11] p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ff7a45]/5 to-transparent" />
                <Zap className="h-6 w-6 text-[#ff7a45] mb-4" />
                <h3 className="text-lg font-semibold mb-2">Clips courts</h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  Génère N clips pour les réseaux depuis une longue vidéo.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#0f0f11] p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6aa8ff]/5 to-transparent" />
                <Layers className="h-6 w-6 text-[#6aa8ff] mb-4" />
                <h3 className="text-lg font-semibold mb-2">Timeline multi-pistes</h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  Main, B-roll, captions, musique — visualisation en temps réel.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow section */}
        <section id="workflow" className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-5xl px-8 py-24">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-[#ff7a45] mb-4">Workflow</div>
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-snug">
                  Parle à Director.<br />
                  <span className="text-white/30">Il comprend le montage.</span>
                </h2>
                <p className="mt-6 text-white/40 leading-relaxed">
                  Director est un agent IA entraîné pour le montage vidéo. Il transforme tes demandes en langage naturel en séquences d&apos;opérations précises sur ta timeline.
                </p>
                <div className="mt-8 space-y-4">
                  {[
                    "\"Supprime tous les silences de plus de 0.5s\"",
                    "\"Génère 5 clips de 60 secondes pour Instagram\"",
                    "\"Ajoute des captions en style bold\"",
                  ].map((q) => (
                    <div key={q} className="flex items-start gap-3">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff7a45] shrink-0" />
                      <p className="text-sm text-white/50 font-mono">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-[#0f0f11] p-1 shadow-2xl shadow-black/40">
                <div className="rounded-lg bg-[#121214] overflow-hidden">
                  <div className="border-b border-white/[0.06] px-4 py-3 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#ff7a45]" />
                    <span className="text-xs font-semibold">Director</span>
                  </div>
                  <div className="p-4 space-y-4">
                    {[
                      { role: "user", text: "Coupe les silences et mets des captions kinetic" },
                      { role: "assistant", text: "12 silences détectés. Suppression en cours…" },
                      { role: "tool", text: "remove_silences({ trackId: \"main\", threshold_db: -40 })" },
                      { role: "tool", text: "add_captions({ trackId: \"main\", style: \"kinetic\" })" },
                      { role: "assistant", text: "Fait. Prévisualise sur la timeline." },
                    ].map((m, i) => (
                      <div key={i}>
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-1">
                          {m.role === "user" ? "You" : m.role === "assistant" ? "Director" : "Tool"}
                        </div>
                        <p className={`text-[12px] leading-relaxed ${m.role === "tool" ? "font-mono text-[#5ee2a0] bg-black/30 border border-white/[0.06] rounded-lg p-2" : m.role === "user" ? "text-white/80" : "text-white/45"}`}>
                          {m.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-5xl px-8 py-32 text-center">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Prêt à monter différemment ?
            </h2>
            <p className="mt-4 text-white/40 max-w-sm mx-auto">
              Gratuit pendant le beta. Aucune carte requise.
            </p>
            <div className="mt-10">
              {hasClerkConfig ? (
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="group inline-flex items-center gap-2 rounded-full bg-[#ff7a45] px-8 py-3 font-semibold text-white hover:bg-[#ff6a35] transition">
                      Commencer gratuitement
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
                    </button>
                  </SignInButton>
                </SignedOut>
              ) : (
                <Link href="/dashboard" className="group inline-flex items-center gap-2 rounded-full bg-[#ff7a45] px-8 py-3 font-semibold text-white hover:bg-[#ff6a35] transition">
                  Commencer gratuitement
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
                </Link>
              )}
              <SignedIn>
                <Link href="/dashboard" className="group inline-flex items-center gap-2 rounded-full bg-[#ff7a45] px-8 py-3 font-semibold text-white hover:bg-[#ff6a35] transition">
                  Aller au dashboard
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
                </Link>
              </SignedIn>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] px-8 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-gradient-to-br from-[#ff7a45] to-[#c44e2a]" />
            <span className="text-sm font-semibold">Edito</span>
          </div>
          <p className="text-xs text-white/25">© 2026 Edito. Le montage, à la vitesse de la pensée.</p>
        </footer>
      </div>
    </div>
  );
}
