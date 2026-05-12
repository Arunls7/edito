"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  LayoutGrid,
  Music2,
  Captions,
  Mic,
  Type,
  Sparkles,
  Palette,
  Settings,
  Plus,
  Search,
  Film,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CaptionStyle } from "./remotion/caption-overlay";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToolId =
  | "media"
  | "music"
  | "captions"
  | "voice"
  | "text"
  | "effects"
  | "color"
  | "settings";

type Props = {
  projectId: Id<"projects">;
  projectTitle: string;
  hasVideo: boolean;
  captionStyle: CaptionStyle;
  onCaptionStyleChange: (s: CaptionStyle) => void;
};

// ─── Nav items ────────────────────────────────────────────────────────────────

const TOOLS: { id: ToolId; icon: typeof LayoutGrid; label: string }[] = [
  { id: "media",    icon: LayoutGrid, label: "Media" },
  { id: "music",    icon: Music2,     label: "Music" },
  { id: "captions", icon: Captions,   label: "Subtitles" },
  { id: "voice",    icon: Mic,        label: "Voiceover" },
  { id: "text",     icon: Type,       label: "Text" },
  { id: "effects",  icon: Sparkles,   label: "Effects" },
  { id: "color",    icon: Palette,    label: "Color" },
  { id: "settings", icon: Settings,   label: "Settings" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// ─── EditorLeftRail ───────────────────────────────────────────────────────────

export function EditorLeftRail({
  projectId,
  projectTitle,
  hasVideo,
  captionStyle,
  onCaptionStyleChange,
}: Props) {
  const [active, setActive] = useState<ToolId>("media");

  const panelLabel: Record<ToolId, string> = {
    media:    "Uploads & assets",
    music:    "Music",
    captions: "Subtitles",
    voice:    "Voiceover",
    text:     "Text",
    effects:  "Effects",
    color:    "Color",
    settings: "Settings",
  };

  return (
    <div className="flex h-full min-h-0 shrink-0 border-r border-white/[0.08] bg-[#121214]">
      {/* Icon nav */}
      <nav
        className="flex w-[52px] flex-col items-center gap-1 border-r border-white/[0.06] py-3"
        aria-label="Tools"
      >
        {TOOLS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            title={label}
            onClick={() => setActive(id)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition",
              active === id
                ? "bg-white/[0.12] text-white shadow-inner shadow-black/20"
                : "text-white/45 hover:bg-white/[0.06] hover:text-white/75",
            )}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>
        ))}
      </nav>

      {/* Panel */}
      <div className="flex min-w-[220px] w-[min(100%,280px)] flex-1 flex-col bg-[#0f0f11]/80">
        {/* Panel header */}
        <div className="border-b border-white/[0.06] px-4 py-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
            {panelLabel[active]}
          </h2>

          {active === "media" && (
            <div className="mt-3 flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/35" />
                <input
                  type="search"
                  placeholder="Search assets…"
                  className="w-full rounded-lg border border-white/[0.08] bg-black/30 py-2 pl-8 pr-2 text-xs text-white/90 placeholder:text-white/35 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/15"
                  readOnly
                />
              </div>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#121214] shadow-sm transition hover:bg-white/95"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                Add
              </button>
            </div>
          )}
        </div>

        {/* Panel content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {active === "media" && (
            <div className="grid grid-cols-2 gap-2 p-4">
              <div className="flex aspect-video flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-white/[0.12] bg-white/[0.03] text-[10px] text-white/35">
                <Film className="h-5 w-5 opacity-50" />
                Slot
              </div>
              <div className="flex aspect-video flex-col justify-between rounded-lg border border-white/[0.08] bg-gradient-to-br from-white/[0.08] to-transparent p-2 text-left">
                <Film className="h-4 w-4 text-white/60" />
                <span className="truncate text-[10px] font-medium leading-tight text-white/80">
                  {projectTitle}
                </span>
                <span className="text-[9px] text-white/40">
                  {hasVideo ? "Main clip" : "No media"}
                </span>
              </div>
            </div>
          )}

          {active === "captions" && (
            <CaptionsPanel
              projectId={projectId}
              captionStyle={captionStyle}
              onStyleChange={onCaptionStyleChange}
            />
          )}

          {active !== "media" && active !== "captions" && (
            <div className="p-4 text-[12px] leading-relaxed text-white/35">
              Panel{" "}
              <span className="font-medium text-white/55">{panelLabel[active]}</span>{" "}
              — bientôt disponible.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CaptionsPanel ────────────────────────────────────────────────────────────

const CAPTION_STYLES: {
  id: CaptionStyle;
  label: string;
  desc: string;
  preview: React.ReactNode;
}[] = [
  {
    id: "minimal",
    label: "Minimal",
    desc: "Fondu doux, fond sombre",
    preview: (
      <span
        style={{
          background: "rgba(0,0,0,0.62)",
          color: "#fff",
          padding: "2px 7px",
          borderRadius: 4,
          fontSize: 10,
          fontWeight: 500,
        }}
      >
        Bonjour
      </span>
    ),
  },
  {
    id: "bold",
    label: "Bold",
    desc: "Pop scale, jaune outline",
    preview: (
      <span
        style={{
          color: "#FFE600",
          fontWeight: 900,
          fontSize: 13,
          textShadow: "1px 1px 0 #000, -1px -1px 0 #000",
          letterSpacing: "-0.01em",
        }}
      >
        BONJOUR
      </span>
    ),
  },
  {
    id: "kinetic",
    label: "Kinetic",
    desc: "Slide-up, dégradé violet",
    preview: (
      <span
        style={{
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.9) 0%, rgba(168,85,247,0.9) 100%)",
          color: "#fff",
          padding: "2px 7px",
          borderRadius: 6,
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        Bonjour
      </span>
    ),
  },
];

type Seg = { start: number; end: number; trackId: string; text?: string };

function CaptionsPanel({
  projectId,
  captionStyle,
  onStyleChange,
}: {
  projectId: Id<"projects">;
  captionStyle: CaptionStyle;
  onStyleChange: (s: CaptionStyle) => void;
}) {
  const addCaptions = useAction(api.tools.addCaptions);
  const rawSegments = useQuery(api.projects.listSegments, { projectId });
  const captions = (rawSegments as Seg[] | undefined ?? []).filter(
    (s) => s.trackId === "captions" && s.text
  );

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await addCaptions({ projectId, style: captionStyle });
      if (!res.ok) setError(res.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      {/* Style selector */}
      <section>
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">
          Style
        </p>
        <div className="flex flex-col gap-1.5">
          {CAPTION_STYLES.map(({ id, label, desc, preview }) => (
            <button
              key={id}
              type="button"
              onClick={() => onStyleChange(id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition",
                captionStyle === id
                  ? "border-white/[0.22] bg-white/[0.08]"
                  : "border-white/[0.06] bg-transparent hover:bg-white/[0.04]"
              )}
            >
              <div className="flex h-9 w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/70">
                {preview}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-white/90">{label}</p>
                <p className="text-[10px] text-white/40">{desc}</p>
              </div>
              <div
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full transition",
                  captionStyle === id ? "bg-white/80" : "bg-white/15"
                )}
              />
            </button>
          ))}
        </div>
      </section>

      {/* Captions list */}
      {captions.length > 0 && (
        <section>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">
            {captions.length} captions
          </p>
          <div className="max-h-52 overflow-y-auto rounded-xl border border-white/[0.07] bg-black/25">
            {captions.map((c, i) => (
              <div
                key={i}
                className="flex gap-2.5 border-b border-white/[0.05] px-3 py-2 last:border-0"
              >
                <span className="shrink-0 pt-px font-mono text-[9px] tabular-nums text-white/30">
                  {fmtTime(c.start)}
                </span>
                <p className="text-[11px] leading-snug text-white/70">{c.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Error */}
      {error && (
        <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
          {error}
        </p>
      )}

      {/* Generate button */}
      <button
        type="button"
        onClick={() => void generate()}
        disabled={generating}
        className="flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-[13px] font-semibold text-[#121214] shadow-sm transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {generating ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Génération…
          </>
        ) : captions.length > 0 ? (
          <>
            <RefreshCw className="h-3.5 w-3.5" />
            Régénérer
          </>
        ) : (
          "Générer les captions"
        )}
      </button>

      {captions.length === 0 && !generating && (
        <p className="text-center text-[11px] leading-relaxed text-white/30">
          Nécessite un transcript. La vidéo est transcrite automatiquement à l'import.
        </p>
      )}
    </div>
  );
}
