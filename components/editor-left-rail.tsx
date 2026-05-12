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
  | "media" | "music" | "captions" | "voice"
  | "text"  | "effects" | "color"  | "settings";

type Props = {
  projectId: Id<"projects">;
  projectTitle: string;
  hasVideo: boolean;
  captionStyle: CaptionStyle;
  onCaptionStyleChange: (s: CaptionStyle) => void;
};

const TOOLS: { id: ToolId; icon: typeof LayoutGrid; label: string }[] = [
  { id: "media",    icon: LayoutGrid, label: "Media"    },
  { id: "music",    icon: Music2,     label: "Music"    },
  { id: "captions", icon: Captions,   label: "Subtitles"},
  { id: "voice",    icon: Mic,        label: "Voiceover"},
  { id: "text",     icon: Type,       label: "Text"     },
  { id: "effects",  icon: Sparkles,   label: "Effects"  },
  { id: "color",    icon: Palette,    label: "Color"    },
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
  projectId, projectTitle, hasVideo, captionStyle, onCaptionStyleChange,
}: Props) {
  const [active, setActive] = useState<ToolId>("media");

  const panelLabel: Record<ToolId, string> = {
    media:    "MEDIA",
    music:    "MUSIC",
    captions: "SUBTITLES",
    voice:    "VOICEOVER",
    text:     "TEXT",
    effects:  "EFFECTS",
    color:    "COLOR",
    settings: "SETTINGS",
  };

  return (
    <div
      className="flex h-full min-h-0 shrink-0 border-r"
      style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(10,10,10,0.85)", backdropFilter: "blur(20px)" }}
    >
      {/* ── Icon nav ─────────────────────────────────────── */}
      <nav
        className="flex w-[48px] flex-col items-center gap-0.5 border-r py-3"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
        aria-label="Tools"
      >
        {TOOLS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            title={label}
            onClick={() => setActive(id)}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-all"
            style={active === id
              ? { color: "#FF6B35", background: "rgba(255,107,53,0.1)" }
              : { color: "#4A4A4A" }
            }
          >
            <Icon className="h-[17px] w-[17px]" strokeWidth={active === id ? 2 : 1.5} />
          </button>
        ))}
      </nav>

      {/* ── Panel ────────────────────────────────────────── */}
      <div className="flex w-[min(100%,272px)] min-w-[210px] flex-1 flex-col">
        {/* Header */}
        <div className="border-b px-4 py-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <h2 className="font-mono text-[9px] tracking-[0.18em] text-[#4A4A4A]">
            {panelLabel[active]}
          </h2>

          {active === "media" && (
            <div className="mt-2.5 flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#4A4A4A]" />
                <input
                  type="search"
                  placeholder="Search…"
                  className="w-full rounded-lg border py-1.5 pl-7 pr-2 font-mono text-[11px] text-[#F5F5F5] placeholder:text-[#4A4A4A] focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}
                  readOnly
                />
              </div>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 font-mono text-[11px] font-semibold tracking-[0.04em] text-white transition hover:opacity-85"
                style={{ background: "linear-gradient(135deg, #FF6B35 0%, #e04e1e 100%)" }}
              >
                <Plus className="h-3 w-3" strokeWidth={2.5} />
                ADD
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {active === "media" && (
            <div className="grid grid-cols-2 gap-2 p-3">
              <div
                className="flex aspect-video flex-col items-center justify-center gap-1 rounded-lg border border-dashed font-mono text-[9px] text-[#4A4A4A]"
                style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)" }}
              >
                <Film className="h-4 w-4 opacity-35" />
                SLOT
              </div>
              <div
                className="flex aspect-video flex-col justify-between rounded-lg border p-2 text-left"
                style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}
              >
                <Film className="h-3.5 w-3.5" style={{ color: "rgba(255,107,53,0.7)" }} />
                <span className="truncate font-mono text-[9px] font-medium text-[#7A7A7A]">
                  {projectTitle}
                </span>
                <span className="font-mono text-[8px] tracking-[0.08em] text-[#4A4A4A]">
                  {hasVideo ? "MAIN CLIP" : "NO MEDIA"}
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
            <div className="p-4">
              <p className="font-mono text-[10px] leading-relaxed tracking-[0.04em] text-[#4A4A4A]">
                {panelLabel[active]}{" "}
                <span className="text-[#7A7A7A]">—</span>{" "}
                bientôt disponible.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Caption styles ───────────────────────────────────────────────────────────

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
      <span style={{ background: "rgba(0,0,0,0.62)", color: "#fff", padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 500 }}>
        Bonjour
      </span>
    ),
  },
  {
    id: "bold",
    label: "Bold",
    desc: "Pop scale, jaune outline",
    preview: (
      <span style={{ color: "#FFE600", fontWeight: 900, fontSize: 13, textShadow: "1px 1px 0 #000, -1px -1px 0 #000", letterSpacing: "-0.01em" }}>
        BONJOUR
      </span>
    ),
  },
  {
    id: "kinetic",
    label: "Kinetic",
    desc: "Slide-up, dégradé violet",
    preview: (
      <span style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.9) 0%, rgba(168,85,247,0.9) 100%)", color: "#fff", padding: "2px 7px", borderRadius: 6, fontSize: 10, fontWeight: 700 }}>
        Bonjour
      </span>
    ),
  },
];

type Seg = { start: number; end: number; trackId: string; text?: string };

function CaptionsPanel({
  projectId, captionStyle, onStyleChange,
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
    <div className="flex flex-col gap-4 p-3">
      {/* Style selector */}
      <section>
        <p className="mb-2 font-mono text-[9px] tracking-[0.18em] text-[#4A4A4A]">STYLE</p>
        <div className="flex flex-col gap-1">
          {CAPTION_STYLES.map(({ id, label, desc, preview }) => (
            <button
              key={id}
              type="button"
              onClick={() => onStyleChange(id)}
              className="flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition-all"
              style={captionStyle === id
                ? { borderColor: "rgba(255,107,53,0.4)", background: "rgba(255,107,53,0.06)" }
                : { borderColor: "rgba(255,255,255,0.06)", background: "transparent" }
              }
            >
              <div
                className="flex h-8 w-[54px] shrink-0 items-center justify-center overflow-hidden rounded-lg"
                style={{ background: "rgba(0,0,0,0.6)" }}
              >
                {preview}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-[#F5F5F5]">{label}</p>
                <p className="font-mono text-[9px] text-[#4A4A4A]">{desc}</p>
              </div>
              <div
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: captionStyle === id ? "#FF6B35" : "rgba(255,255,255,0.12)" }}
              />
            </button>
          ))}
        </div>
      </section>

      {/* Caption list */}
      {captions.length > 0 && (
        <section>
          <p className="mb-2 font-mono text-[9px] tracking-[0.18em] text-[#4A4A4A]">
            {captions.length} CAPTIONS
          </p>
          <div
            className="max-h-48 overflow-y-auto rounded-xl border"
            style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}
          >
            {captions.map((c, i) => (
              <div
                key={i}
                className="flex gap-2.5 border-b px-3 py-2 last:border-0"
                style={{ borderColor: "rgba(255,255,255,0.04)" }}
              >
                <span className="shrink-0 pt-px font-mono text-[9px] tabular-nums text-[#4A4A4A]">
                  {fmtTime(c.start)}
                </span>
                <p className="text-[11px] leading-snug text-[#7A7A7A]">{c.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Error */}
      {error && (
        <p
          className="rounded-xl border px-3 py-2 font-mono text-[10px] text-red-300/80"
          style={{ borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)" }}
        >
          {error}
        </p>
      )}

      {/* Generate */}
      <button
        type="button"
        onClick={() => void generate()}
        disabled={generating}
        className="flex items-center justify-center gap-2 rounded-xl py-2.5 font-mono text-[11px] font-semibold tracking-[0.06em] text-white shadow-sm transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
        style={{ background: "linear-gradient(135deg, #FF6B35 0%, #e04e1e 100%)" }}
      >
        {generating ? (
          <><Loader2 className="h-3 w-3 animate-spin" /> GÉNÉRATION…</>
        ) : captions.length > 0 ? (
          <><RefreshCw className="h-3 w-3" /> RÉGÉNÉRER</>
        ) : (
          "GÉNÉRER LES CAPTIONS"
        )}
      </button>

      {captions.length === 0 && !generating && (
        <p className="text-center font-mono text-[9px] leading-relaxed tracking-[0.04em] text-[#4A4A4A]">
          Transcription auto à l'import.
        </p>
      )}
    </div>
  );
}
