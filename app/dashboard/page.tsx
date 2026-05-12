"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UploadZone } from "@/components/upload-zone";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Film, Clock } from "lucide-react";
import { hasClerkPublishableConfig } from "@/lib/clerk-config";

export default function DashboardPage() {
  const projects = useQuery(api.projects.list);

  return (
    <main className="relative z-10 min-h-screen">
      <nav className="flex items-center justify-between border-b border-[var(--color-border)] px-8 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-gradient-to-br from-[var(--color-accent)] to-[#c44e2a]" />
          <span className="font-medium">Rushly</span>
        </Link>
        {hasClerkPublishableConfig() ? <UserButton /> : null}
      </nav>

      <div className="mx-auto max-w-5xl px-8 py-12">
        <h1 className="text-3xl font-serif mb-2">Tes projets</h1>
        <p className="text-[var(--color-text-muted)] mb-8">
          Upload une vidéo pour commencer. L&apos;agent prend la suite.
        </p>

        <UploadZone />

        <div className="mt-12">
          <h2 className="text-sm uppercase tracking-wider text-[var(--color-text-dim)] mb-4">
            Récents
          </h2>

          {projects === undefined && (
            <div className="text-sm text-[var(--color-text-muted)]">Chargement…</div>
          )}

          {projects && projects.length === 0 && (
            <div className="rounded-lg border border-dashed border-[var(--color-border)] p-12 text-center text-[var(--color-text-muted)]">
              Aucun projet pour l&apos;instant. Upload ta première vidéo ci-dessus.
            </div>
          )}

          {projects && projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p: (typeof projects)[number]) => (
                <Link
                  key={p._id}
                  href={`/project/${p._id}`}
                  className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 hover:border-[var(--color-border-light)] transition"
                >
                  <div className="aspect-video rounded bg-[var(--color-bg-panel)] mb-3 flex items-center justify-center">
                    <Film className="h-8 w-8 text-[var(--color-text-dim)]" />
                  </div>
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--color-text-muted)]">
                    <Clock className="h-3 w-3" />
                    {new Date(p._creationTime).toLocaleDateString("fr-FR")}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
