import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ArrowRight, Sparkles } from "lucide-react";
import { hasClerkPublishableConfig } from "@/lib/clerk-config";

export default function Home() {
  const hasClerkConfig = hasClerkPublishableConfig();

  return (
    <main className="relative z-10 min-h-screen">
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-gradient-to-br from-[var(--color-accent)] to-[#c44e2a]" />
          <span className="text-lg font-medium">Edito</span>
        </div>
        <div className="flex items-center gap-4">
          {hasClerkConfig ? (
            <>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition">
                    Se connecter
                  </button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button className="rounded-full bg-[var(--color-text)] px-4 py-1.5 text-sm font-medium text-[var(--color-bg)] hover:opacity-90 transition">
                    Commencer
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition"
                >
                  Dashboard
                </Link>
                <UserButton />
              </SignedIn>
            </>
          ) : (
            <Link
              href="/dashboard"
              className="rounded-full bg-[var(--color-text)] px-4 py-1.5 text-sm font-medium text-[var(--color-bg)] hover:opacity-90 transition"
            >
              Ouvrir le dashboard
            </Link>
          )}
        </div>
      </nav>

      <section className="mx-auto max-w-4xl px-8 pt-24 pb-32 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-1 text-xs text-[var(--color-text-muted)] mb-8">
          <Sparkles className="h-3 w-3 text-[var(--color-accent)]" />
          MVP en construction
        </div>

        <h1 className="font-serif text-6xl md:text-7xl leading-[1.05] tracking-tight">
          Le montage,
          <br />
          <em className="text-[var(--color-accent)]">à la vitesse de la pensée.</em>
        </h1>

        <p className="mt-8 text-lg text-[var(--color-text-muted)] max-w-xl mx-auto">
          Tu décris ce que tu veux. L&apos;agent coupe, légende, recadre, exporte. Tu valides.
        </p>

        <div className="mt-12 flex items-center justify-center gap-4">
          {hasClerkConfig ? (
            <SignedOut>
              <SignInButton mode="modal">
                <button className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3 font-medium text-[var(--color-bg)] hover:opacity-90 transition">
                  Essayer maintenant
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
                </button>
              </SignInButton>
            </SignedOut>
          ) : null}
          {hasClerkConfig ? (
            <SignedIn>
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3 font-medium text-[var(--color-bg)] hover:opacity-90 transition"
              >
                Aller au dashboard
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
              </Link>
            </SignedIn>
          ) : (
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3 font-medium text-[var(--color-bg)] hover:opacity-90 transition"
            >
              Continuer sans auth
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
