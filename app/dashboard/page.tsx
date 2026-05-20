"use client";

import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Film, Clock, Plus, Loader2 } from "lucide-react";
import { hasClerkPublishableConfig } from "@/lib/clerk-config";
import { useState } from "react";

export default function DashboardPage() {
  const projects = useQuery(api.projects.list);
  const createEmpty = useMutation(api.projects.createEmpty);
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function newProject() {
    if (creating) return;
    setCreating(true);
    try {
      const id = await createEmpty({ title: "Nouveau projet" });
      router.push(`/project/${id}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="relative z-10 min-h-screen bg-[#0A0A0A]">
      {/* Top nav */}
      <nav
        className="flex items-center justify-between border-b px-8 py-4"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(10,10,10,0.8)", backdropFilter: "blur(20px)" }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-black text-white"
            style={{ background: "linear-gradient(135deg, #FF6B35 0%, #e04e1e 100%)" }}
          >
            R
          </span>
          <span className="font-mono text-[12px] tracking-[0.1em] text-[#7A7A7A]">RUSHLY</span>
        </Link>
        {hasClerkPublishableConfig() ? <UserButton /> : null}
      </nav>

      <div className="mx-auto max-w-5xl px-8 py-12">
        {/* Header + CTA */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#F5F5F5]">Projets</h1>
            <p className="mt-1 font-mono text-[11px] tracking-[0.06em] text-[#4A4A4A]">
              Ouvre un projet existant ou crée-en un nouveau.
            </p>
          </div>

          <button
            type="button"
            onClick={newProject}
            disabled={creating}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-85 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #FF6B35 0%, #e04e1e 100%)" }}
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Nouveau projet
          </button>
        </div>

        {/* Project grid */}
        {projects === undefined && (
          <p className="font-mono text-[11px] text-[#4A4A4A]">Chargement…</p>
        )}

        {projects && projects.length === 0 && (
          <div
            className="rounded-xl border border-dashed p-16 text-center"
            style={{ borderColor: "rgba(255,255,255,0.07)" }}
          >
            <p className="font-mono text-[11px] tracking-[0.06em] text-[#4A4A4A]">Aucun projet.</p>
            <p className="mt-1 font-mono text-[10px] text-[#4A4A4A]/60">
              Clique sur "Nouveau projet" pour commencer.
            </p>
          </div>
        )}

        {projects && projects.length > 0 && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p: (typeof projects)[number]) => (
              <Link
                key={p._id}
                href={`/project/${p._id}`}
                className="group rounded-xl border p-4 transition-all"
                style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
              >
                <div
                  className="mb-3 flex aspect-video items-center justify-center rounded-lg border"
                  style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.015)" }}
                >
                  <Film className="h-7 w-7 text-[#4A4A4A] transition group-hover:text-[#FF6B35]" strokeWidth={1.5} />
                </div>

                <div className="font-medium truncate text-[13px] text-[#F5F5F5]">{p.title}</div>

                <div className="mt-1.5 flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-[#4A4A4A]" />
                  <span className="font-mono text-[9px] tracking-[0.06em] text-[#4A4A4A]">
                    {new Date(p._creationTime).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
