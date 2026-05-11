"use client";

import { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

type ToolId =
  | "media"
  | "music"
  | "captions"
  | "voice"
  | "text"
  | "effects"
  | "color"
  | "settings";

const TOOLS: { id: ToolId; icon: typeof LayoutGrid; label: string }[] = [
  { id: "media", icon: LayoutGrid, label: "Media" },
  { id: "music", icon: Music2, label: "Music" },
  { id: "captions", icon: Captions, label: "Subtitles" },
  { id: "voice", icon: Mic, label: "Voiceover" },
  { id: "text", icon: Type, label: "Text" },
  { id: "effects", icon: Sparkles, label: "Effects" },
  { id: "color", icon: Palette, label: "Color" },
  { id: "settings", icon: Settings, label: "Settings" },
];

type Props = {
  projectTitle: string;
  hasVideo: boolean;
};

export function EditorLeftRail({ projectTitle, hasVideo }: Props) {
  const [active, setActive] = useState<ToolId>("media");

  return (
    <div className="flex h-full min-h-0 shrink-0 border-r border-white/[0.08] bg-[#121214]">
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

      <div className="flex w-[min(100%,280px)] flex-col min-w-[220px] flex-1 bg-[#0f0f11]/80">
        <div className="border-b border-white/[0.06] px-4 py-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
            Uploads &amp; assets
          </h2>
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
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {active === "media" ? (
            <div className="grid grid-cols-2 gap-2">
              <div
                className={cn(
                  "aspect-video rounded-lg border border-dashed border-white/[0.12] bg-white/[0.03]",
                  "flex flex-col items-center justify-center gap-1 text-[10px] text-white/35",
                )}
              >
                <Film className="h-5 w-5 opacity-50" />
                Slot
              </div>
              <div
                className={cn(
                  "aspect-video rounded-lg border border-white/[0.08] bg-gradient-to-br from-white/[0.08] to-transparent",
                  "flex flex-col justify-between p-2 text-left",
                )}
              >
                <Film className="h-4 w-4 text-white/60" />
                <span className="truncate text-[10px] font-medium leading-tight text-white/80">
                  {projectTitle}
                </span>
                <span className="text-[9px] text-white/40">
                  {hasVideo ? "Main clip" : "No media"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs leading-relaxed text-white/45">
              This panel is a preview — full controls for{" "}
              <span className="text-white/65">{active}</span> ship next.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
