"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Download } from "lucide-react";
import { hasClerkPublishableConfig } from "@/lib/clerk-config";
import { cn } from "@/lib/utils";

type Props = {
  projectTitle: string;
  directorStatus: "ready" | "busy";
};

export function EditorTopBar({ projectTitle, directorStatus }: Props) {
  return (
    <header
      className={cn(
        "grid h-12 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center border-b px-3 md:px-4",
        "border-white/[0.08] bg-[#141416]/90 backdrop-blur-md",
      )}
    >
      <Link
        href="/dashboard"
        className="flex min-w-0 items-center gap-2 justify-self-start text-sm font-medium tracking-tight text-white/90 transition hover:text-white"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[#c44e2a] text-[10px] font-bold text-white shadow-lg shadow-black/40">
          E
        </span>
        <span className="hidden truncate sm:inline">Edito</span>
      </Link>

      <div className="max-w-[min(420px,46vw)] truncate px-2 text-center text-sm font-medium text-white/95">
        {projectTitle}
      </div>

      <div className="flex items-center justify-end gap-2 md:gap-3">
        <div
          className={cn(
            "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium md:flex",
            directorStatus === "ready"
              ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-200/90"
              : "border-amber-500/35 bg-amber-500/10 text-amber-100/90",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              directorStatus === "ready" ? "bg-emerald-400" : "animate-pulse bg-amber-400",
            )}
          />
          Director · {directorStatus === "ready" ? "Ready" : "Thinking"}
        </div>

        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/90 opacity-60 transition hover:bg-white/[0.08]"
        >
          <Download className="h-3.5 w-3.5 opacity-80" />
          Export
        </button>

        {hasClerkPublishableConfig() ? (
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 ring-1 ring-white/10",
              },
            }}
          />
        ) : null}
      </div>
    </header>
  );
}
