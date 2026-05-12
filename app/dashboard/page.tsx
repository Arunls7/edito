"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DashboardChat } from "@/components/dashboard-chat";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Film, Clock } from "lucide-react";
import { hasClerkPublishableConfig } from "@/lib/clerk-config";

export default function DashboardPage() {
  const projects = useQuery(api.projects.list);

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
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#F5F5F5]">
            Projets
          </h1>
          <p className="mt-1 font-mono text-[11px] tracking-[0.06em] text-[#4A4A4A]">
            Décris ton projet et l'agent prend la suite.
          </p>
        </div>

        <DashboardChat />

        {/* Recent projects */}
        <div className="mt-12">
          <p className="mb-4 font-mono text-[9px] tracking-[0.18em] text-[#4A4A4A]">RÉCENTS</p>

          {projects === undefined && (
            <p className="font-mono text-[11px] text-[#4A4A4A]">Chargement…</p>
          )}

          {projects && projects.length === 0 && (
            <div
              className="rounded-xl border border-dashed p-12 text-center"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            >
              <p className="font-mono text-[11px] tracking-[0.06em] text-[#4A4A4A]">
                Nothing yet.
              </p>
              <p className="mt-1 font-mono text-[10px] text-[#4A4A4A]/60">
                Ship something already.
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
                  {/* Thumbnail placeholder */}
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
      </div>
    </main>
  );
}
