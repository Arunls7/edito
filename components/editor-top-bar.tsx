"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Download } from "lucide-react";
import { hasClerkPublishableConfig } from "@/lib/clerk-config";
import { cn } from "@/lib/utils";

type Props = {
  projectTitle: string;
  directorStatus: "ready" | "busy";
  hasVideo?: boolean;
};

export function EditorTopBar({ projectTitle, directorStatus, hasVideo = false }: Props) {
  return (
    <header
      className={cn(
        "grid h-11 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center border-b px-4",
        "border-white/[0.07] bg-[#0a0a0a]/80 backdrop-blur-xl",
      )}
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Left — logo */}
      <Link
        href="/dashboard"
        className="flex min-w-0 items-center gap-2.5 justify-self-start transition"
      >
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-black text-white shadow-md"
          style={{ background: "linear-gradient(135deg, #FF6B35 0%, #e04e1e 100%)" }}
        >
          R
        </span>
        <span className="hidden truncate font-mono text-[12px] tracking-[0.06em] text-[#7A7A7A] transition hover:text-[#F5F5F5] sm:inline">
          RUSHLY
        </span>
      </Link>

      {/* Center — project title */}
      <div className="max-w-[min(420px,46vw)] truncate px-3 text-center font-mono text-[12px] tracking-[0.04em] text-[#F5F5F5]/80">
        {projectTitle}
      </div>

      {/* Right — status + actions */}
      <div className="flex items-center justify-end gap-2">
        {/* Director status pill */}
        <div
          className={cn(
            "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] md:flex",
            directorStatus === "ready"
              ? "border-white/[0.07] bg-white/[0.03] text-[#7A7A7A]"
              : "border-[#FF6B35]/25 bg-[#FF6B35]/08 text-[#FF6B35]/80",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              directorStatus === "ready"
                ? "bg-[#7A7A7A]/60"
                : "animate-pulse bg-[#FF6B35]",
            )}
          />
          {directorStatus === "ready" ? "DIRECTOR · READY" : "DIRECTOR · BUSY"}
        </div>

        {/* Export */}
        <button
          type="button"
          disabled={!hasVideo}
          title={hasVideo ? "Export — bientôt disponible" : "Importe une vidéo d'abord"}
          onClick={() => hasVideo && alert("Export Remotion Lambda — disponible dans la prochaine version.")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[11px] tracking-[0.06em] transition",
            hasVideo
              ? "border-white/[0.08] bg-white/[0.03] text-[#7A7A7A] hover:border-[#FF6B35]/40 hover:text-[#FF6B35]"
              : "cursor-not-allowed border-white/[0.04] bg-transparent text-white/20",
          )}
        >
          <Download className="h-3 w-3" strokeWidth={1.75} />
          EXPORT
        </button>

        {hasClerkPublishableConfig() && (
          <UserButton
            appearance={{
              elements: { avatarBox: "h-7 w-7 ring-1 ring-white/[0.08]" },
            }}
          />
        )}
      </div>
    </header>
  );
}
