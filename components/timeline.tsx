"use client";

import { useMemo, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
type Props = {
  projectId: Id<"projects">;
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
};

function formatTick(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function Timeline({
  projectId,
  currentTime,
  duration,
  onSeek,
}: Props) {
  const segments = useQuery(api.projects.listSegments, { projectId });

  const timelineDuration = useMemo(() => {
    if (duration > 0 && Number.isFinite(duration)) return duration;
    if (segments && segments.length > 0) {
      const end = segments[segments.length - 1]?.end ?? 0;
      return Math.max(90, end || 90);
    }
    return 90;
  }, [duration, segments]);

  const step = 15;
  const ticks = useMemo(() => {
    const out: number[] = [];
    for (let t = 0; t <= timelineDuration + step; t += step) {
      out.push(t);
    }
    return out;
  }, [timelineDuration]);

  const playheadPct =
    timelineDuration > 0
      ? Math.min(100, Math.max(0, (currentTime / timelineDuration) * 100))
      : 0;

  function onRailClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const p = x / rect.width;
    onSeek(p * timelineDuration);
  }

  return (
    <div className="flex h-full min-h-[200px] flex-col border-t border-white/[0.08] bg-[#101012]">
      <div className="flex min-h-0 flex-1 gap-0 overflow-hidden">
        <div className="flex w-[72px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0d0d0f] pt-7">
          <div className="flex h-[52px] items-center px-3 text-[10px] font-semibold uppercase tracking-wider text-white/35">
            B-roll
          </div>
          <div className="flex h-[52px] items-center px-3 text-[10px] font-semibold uppercase tracking-wider text-white/35">
            Main
          </div>
          <div className="flex h-[52px] items-center px-3 text-[10px] font-semibold uppercase tracking-wider text-white/35">
            Music
          </div>
        </div>

        <div className="relative min-w-0 flex-1 overflow-x-auto">
          <div
            className="relative min-w-[720px] cursor-pointer px-3 pb-2 pt-2"
            onClick={onRailClick}
            role="presentation"
          >
            <div className="relative mb-2 flex h-6 select-none items-end border-b border-white/[0.06] pb-1">
              {ticks.map((t) => (
                <div
                  key={t}
                  className="absolute bottom-1 flex flex-col items-center text-[10px] tabular-nums text-white/40"
                  style={{ left: `${(t / timelineDuration) * 100}%` }}
                >
                  <span>{formatTick(t)}</span>
                </div>
              ))}
            </div>

            <div className="relative space-y-2">
              <TrackSlot height={52}>
                <div className="absolute left-[8%] top-2 bottom-2 w-[28%] rounded-md bg-white/[0.12] ring-1 ring-white/[0.08]" />
              </TrackSlot>

              <TrackSlot height={52}>
                {segments === undefined && (
                  <div className="flex h-full items-center justify-center text-[11px] text-white/30">
                    Loading…
                  </div>
                )}
                {segments && segments.length === 0 && (
                  <div className="flex h-full items-center justify-center text-[11px] text-white/35">
                    No cuts yet — ask Director.
                  </div>
                )}
                {segments &&
                  segments.length > 0 &&
                  segments.map((s, i) => {
                    const endRef =
                      segments[segments.length - 1]?.end || timelineDuration;
                    const denom = endRef > 0 ? endRef : timelineDuration;
                    const left = (s.start / denom) * 100;
                    const width = ((s.end - s.start) / denom) * 100;
                    return (
                      <div
                        key={i}
                        className="absolute top-2 bottom-2 rounded-md bg-gradient-to-b from-white/25 to-white/[0.08] ring-1 ring-white/15"
                        style={{ left: `${left}%`, width: `${width}%` }}
                      />
                    );
                  })}
              </TrackSlot>

              <TrackSlot height={52}>
                <Waveform />
              </TrackSlot>
            </div>

            <div
              className="pointer-events-none absolute bottom-0 top-8 z-10 w-px -translate-x-1/2 bg-white shadow-[0_0_12px_rgba(255,255,255,0.35)]"
              style={{ left: `${playheadPct}%` }}
            >
              <div className="absolute -top-1 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[5px] border-b-[6px] border-x-transparent border-b-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackSlot({
  height,
  children,
}: {
  height: number;
  children: ReactNode;
}) {
  return (
    <div
      className="relative rounded-lg bg-[#18181c]/90 ring-1 ring-white/[0.06]"
      style={{ height }}
    >
      {children}
    </div>
  );
}

function Waveform() {
  const bars = 48;
  return (
    <div className="flex h-full items-center gap-[2px] px-3 opacity-90">
      {Array.from({ length: bars }).map((_, i) => {
        const h = 22 + Math.sin(i * 0.65) * 14 + ((i * 7) % 9);
        return (
          <div
            key={i}
            className="w-[3px] shrink-0 rounded-full bg-gradient-to-t from-violet-400/50 to-white/25"
            style={{ height: `${h}%` }}
          />
        );
      })}
    </div>
  );
}
