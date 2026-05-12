"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Eye, EyeOff, Lock, Unlock, Volume2, VolumeX, Film, Music } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  projectId: Id<"projects">;
  currentTime: number;
  duration: number;
  hasVideo?: boolean;
  videoUrl?: string | null;
  onSeek: (seconds: number) => void;
};

type TrackDef = {
  id: string;
  label: string;
  kind: "video" | "audio";
  height: number;
};

type TrackState = { visible: boolean; muted: boolean; locked: boolean };

// ─── Constants ────────────────────────────────────────────────────────────────

const HEADER_W = 152;
const RULER_H = 22;

const TRACKS: TrackDef[] = [
  { id: "v2",    label: "V2",    kind: "video", height: 56 },
  { id: "main",  label: "V1",    kind: "video", height: 56 },
  { id: "a1",    label: "A1",    kind: "audio", height: 40 },
  { id: "music", label: "Music", kind: "audio", height: 40 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad(n: number) { return String(Math.floor(n)).padStart(2, "0"); }

function toTimecode(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const f = Math.floor((s % 1) * 30);
  return `${pad(h)}:${pad(m)}:${pad(sec)}:${pad(f)}`;
}

function tickInterval(duration: number): { major: number; minor: number } {
  if (duration <= 30)   return { major: 5,   minor: 1 };
  if (duration <= 120)  return { major: 10,  minor: 2 };
  if (duration <= 300)  return { major: 30,  minor: 5 };
  if (duration <= 600)  return { major: 60,  minor: 10 };
  return                       { major: 120, minor: 30 };
}

function formatTick(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  if (m > 0) return `${m}:${pad(sec)}`;
  return `0:${pad(sec)}`;
}

// ─── useVideoThumbnail ────────────────────────────────────────────────────────

function useVideoThumbnail(videoUrl: string | null | undefined, t: number) {
  const [thumb, setThumb] = useState<string | null>(null);
  useEffect(() => {
    if (!videoUrl) return;
    let cancelled = false;
    const v = document.createElement("video");
    v.crossOrigin = "anonymous";
    v.preload = "metadata";
    v.muted = true;
    v.src = videoUrl;
    v.addEventListener("loadedmetadata", () => { v.currentTime = Math.min(t, v.duration || t); });
    v.addEventListener("seeked", () => {
      if (cancelled) return;
      const c = document.createElement("canvas");
      c.width = 128; c.height = 72;
      c.getContext("2d")?.drawImage(v, 0, 0, 128, 72);
      try { setThumb(c.toDataURL("image/jpeg", 0.7)); } catch {}
      v.src = "";
    }, { once: true });
    return () => { cancelled = true; v.src = ""; };
  }, [videoUrl, t]);
  return thumb;
}

// ─── Ruler ────────────────────────────────────────────────────────────────────

function Ruler({ duration, onClick }: { duration: number; onClick: (t: number) => void }) {
  const { major, minor } = tickInterval(duration);
  const ticks: { t: number; isMajor: boolean }[] = [];
  for (let t = 0; t <= duration + minor; t = Math.round((t + minor) * 1000) / 1000) {
    ticks.push({ t, isMajor: Math.round(t % major) === 0 });
  }

  return (
    <div
      className="relative h-full cursor-pointer overflow-hidden"
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onClick(((e.clientX - rect.left) / rect.width) * duration);
      }}
    >
      {ticks.map(({ t, isMajor }) => (
        <div
          key={t}
          className="absolute bottom-0 flex flex-col items-center"
          style={{ left: `${(t / duration) * 100}%` }}
        >
          <div
            className={isMajor ? "h-[10px] w-px bg-white/30" : "h-[5px] w-px bg-white/15"}
          />
          {isMajor && t > 0 && (
            <span
              className="absolute bottom-[11px] -translate-x-1/2 whitespace-nowrap font-mono text-[9px] tabular-nums text-white/40"
              style={{ left: 0 }}
            >
              {formatTick(t)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── VideoClip ────────────────────────────────────────────────────────────────

function VideoClip({
  left, width, label, videoUrl, startTime,
}: {
  left: number; width: number; label: string;
  videoUrl?: string | null; startTime: number;
}) {
  const thumb = useVideoThumbnail(videoUrl, startTime);

  return (
    <div
      className="absolute inset-y-[3px] overflow-hidden rounded-[3px]"
      style={{ left: `${left}%`, width: `${Math.max(width, 0.3)}%` }}
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#3a6ea8] to-[#2a5a90]" />

      {/* Tiled thumbnail strip */}
      {thumb && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${thumb})`,
            backgroundSize: "auto 100%",
            backgroundRepeat: "repeat-x",
            backgroundPosition: "left center",
            opacity: 0.55,
          }}
        />
      )}

      {/* Top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-[#6aaee8]/60" />

      {/* Left edge accent */}
      <div className="absolute inset-y-0 left-0 w-[3px] bg-[#6aaee8]/80" />

      {/* Label */}
      <div className="absolute inset-x-1 top-[3px] flex items-center gap-1 overflow-hidden">
        <Film className="h-2.5 w-2.5 shrink-0 text-white/80" />
        <span className="truncate font-sans text-[10px] font-semibold text-white/90 drop-shadow-sm">
          {label}
        </span>
      </div>

      {/* Bottom shade */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-black/40" />
    </div>
  );
}

// ─── AudioClip ────────────────────────────────────────────────────────────────

function AudioClip({
  left, width, label, color = "#2a6b47",
}: {
  left: number; width: number; label: string; color?: string;
}) {
  const bars = 80;
  return (
    <div
      className="absolute inset-y-[3px] overflow-hidden rounded-[3px]"
      style={{ left: `${left}%`, width: `${Math.max(width, 0.3)}%` }}
    >
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${color}cc 0%, ${color}99 100%)` }}
      />
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: `${color}ff` }} />
      <div className="absolute inset-y-0 left-0 w-[3px]" style={{ background: `${color}ff` }} />

      {/* Mini waveform */}
      <div className="absolute inset-0 flex items-center gap-[1px] overflow-hidden px-2 pt-5">
        {Array.from({ length: bars }).map((_, i) => {
          const h = 30 + Math.abs(Math.sin(i * 0.72 + 1.4) * 38 + Math.cos(i * 0.3) * 18);
          return (
            <div
              key={i}
              className="w-[2px] shrink-0 rounded-full opacity-80"
              style={{ height: `${h}%`, background: "rgba(255,255,255,0.6)" }}
            />
          );
        })}
      </div>

      {/* Label */}
      <div className="absolute inset-x-1 top-[3px] flex items-center gap-1 overflow-hidden">
        <Music className="h-2.5 w-2.5 shrink-0 text-white/80" />
        <span className="truncate font-sans text-[10px] font-semibold text-white/90">
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── TrackHeader ──────────────────────────────────────────────────────────────

function TrackHeader({
  track, state, onChange,
}: {
  track: TrackDef;
  state: TrackState;
  onChange: (s: Partial<TrackState>) => void;
}) {
  const isVideo = track.kind === "video";

  return (
    <div
      className="flex shrink-0 items-center gap-1 border-b border-r border-white/[0.07] bg-[#252529] px-2"
      style={{ height: track.height }}
    >
      {/* Track name */}
      <span className="w-8 font-mono text-[11px] font-semibold text-white/70">
        {track.label}
      </span>

      <div className="flex flex-1 items-center justify-end gap-1">
        {isVideo ? (
          <button
            className="rounded p-0.5 text-white/40 transition-colors hover:text-white/80"
            onClick={() => onChange({ visible: !state.visible })}
            title={state.visible ? "Hide" : "Show"}
          >
            {state.visible
              ? <Eye className="h-3 w-3" />
              : <EyeOff className="h-3 w-3" />
            }
          </button>
        ) : (
          <button
            className="rounded p-0.5 text-white/40 transition-colors hover:text-white/80"
            onClick={() => onChange({ muted: !state.muted })}
            title={state.muted ? "Unmute" : "Mute"}
          >
            {state.muted
              ? <VolumeX className="h-3 w-3" />
              : <Volume2 className="h-3 w-3" />
            }
          </button>
        )}

        <button
          className="rounded p-0.5 text-white/40 transition-colors hover:text-white/80"
          onClick={() => onChange({ locked: !state.locked })}
          title={state.locked ? "Unlock" : "Lock"}
        >
          {state.locked
            ? <Lock className="h-3 w-3" />
            : <Unlock className="h-3 w-3" />
          }
        </button>
      </div>
    </div>
  );
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex h-5 shrink-0 items-center border-b border-r border-white/[0.07] bg-[#1c1c20] px-3">
      <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/25">
        {label}
      </span>
    </div>
  );
}

// ─── Playhead ─────────────────────────────────────────────────────────────────

function Playhead({ pct }: { pct: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 z-30 w-px translate-x-0"
      style={{ left: `${pct}%` }}
    >
      {/* Diamond head */}
      <div className="absolute -top-[1px] left-1/2 -translate-x-1/2">
        <div
          className="h-0 w-0"
          style={{
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "7px solid #f5a623",
          }}
        />
      </div>
      {/* Line */}
      <div className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-[#f5a623]/80 shadow-[0_0_6px_rgba(245,166,35,0.5)]" />
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export function Timeline({
  projectId,
  currentTime,
  duration,
  hasVideo = false,
  videoUrl,
  onSeek,
}: Props) {
  const segments = useQuery(api.projects.listSegments, { projectId });

  const [trackStates, setTrackStates] = useState<Record<string, TrackState>>(() =>
    Object.fromEntries(
      TRACKS.map((t) => [t.id, { visible: true, muted: false, locked: false }])
    )
  );

  const timelineDuration = useMemo(() => {
    if (Number.isFinite(duration) && duration > 0) return duration;
    return 90;
  }, [duration]);

  const playheadPct = timelineDuration > 0
    ? Math.min(100, Math.max(0, (currentTime / timelineDuration) * 100))
    : 0;

  // Segments grouped by track
  const mainSegs = segments?.filter((s) => s.trackId === "main" || s.trackId === undefined) ?? [];
  const musicSegs = segments?.filter((s) => s.trackId === "music") ?? [];

  function setTrack(id: string, partial: Partial<TrackState>) {
    setTrackStates((prev) => ({ ...prev, [id]: { ...prev[id], ...partial } }));
  }

  function onTrackClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const p = (e.clientX - rect.left) / rect.width;
    onSeek(p * timelineDuration);
  }

  const videoTracks = TRACKS.filter((t) => t.kind === "video");
  const audioTracks = TRACKS.filter((t) => t.kind === "audio");

  return (
    <div className="flex h-full flex-col overflow-hidden border-t border-white/[0.07] bg-[#1a1a1e] select-none">
      {/* Toolbar strip */}
      <div className="flex h-7 shrink-0 items-center gap-3 border-b border-white/[0.07] bg-[#222226] px-3">
        <span className="font-mono text-[11px] tabular-nums text-[#f5a623]">
          {toTimecode(currentTime)}
        </span>
        <div className="h-3 w-px bg-white/10" />
        <span className="font-mono text-[10px] tabular-nums text-white/25">
          {Number.isFinite(duration) && duration > 0 ? toTimecode(duration) : "--:--:--:--"}
        </span>
      </div>

      {/* Headers + tracks */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left headers column */}
        <div
          className="flex shrink-0 flex-col overflow-hidden"
          style={{ width: HEADER_W }}
        >
          {/* Ruler spacer */}
          <div
            className="shrink-0 border-b border-r border-white/[0.07] bg-[#1e1e22]"
            style={{ height: RULER_H }}
          />

          {/* Video section */}
          <SectionLabel label="Video" />
          {videoTracks.map((t) => (
            <TrackHeader
              key={t.id}
              track={t}
              state={trackStates[t.id]}
              onChange={(s) => setTrack(t.id, s)}
            />
          ))}

          {/* Audio section */}
          <SectionLabel label="Audio" />
          {audioTracks.map((t) => (
            <TrackHeader
              key={t.id}
              track={t}
              state={trackStates[t.id]}
              onChange={(s) => setTrack(t.id, s)}
            />
          ))}
        </div>

        {/* Scrollable track area */}
        <div className="relative min-w-0 flex-1 overflow-x-auto overflow-y-hidden">
          <div className="relative min-w-[560px]">
            {/* Ruler */}
            <div
              className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#222226]"
              style={{ height: RULER_H }}
            >
              <Ruler duration={timelineDuration} onClick={onSeek} />
            </div>

            {/* Track rows */}
            <div className="relative" onClick={onTrackClick} role="presentation">
              {/* Video section label spacer */}
              <div className="h-5 border-b border-white/[0.07] bg-[#1c1c20]" />

              {/* V2 – B-roll */}
              <TrackRow track={videoTracks[0]} />

              {/* V1 – Main */}
              <TrackRow track={videoTracks[1]}>
                {segments === undefined && (
                  <div className="flex h-full items-center justify-center font-sans text-[11px] text-white/25">
                    Chargement…
                  </div>
                )}
                {hasVideo && segments && segments.length === 0 && (
                  <VideoClip
                    left={0}
                    width={100}
                    label="Rush brut"
                    videoUrl={videoUrl}
                    startTime={0}
                  />
                )}
                {mainSegs.map((s, i) => {
                  const left = (s.start / timelineDuration) * 100;
                  const width = ((s.end - s.start) / timelineDuration) * 100;
                  return (
                    <VideoClip
                      key={i}
                      left={left}
                      width={width}
                      label={`Clip ${i + 1}`}
                      videoUrl={videoUrl}
                      startTime={s.start}
                    />
                  );
                })}
              </TrackRow>

              {/* Audio section label spacer */}
              <div className="h-5 border-b border-white/[0.07] bg-[#1c1c20]" />

              {/* A1 – Main audio */}
              <TrackRow track={audioTracks[0]}>
                {hasVideo && (
                  <AudioClip left={0} width={100} label="Audio" color="#2a6b47" />
                )}
              </TrackRow>

              {/* Music */}
              <TrackRow track={audioTracks[1]}>
                {musicSegs.length > 0
                  ? musicSegs.map((s, i) => {
                      const left = (s.start / timelineDuration) * 100;
                      const width = ((s.end - s.start) / timelineDuration) * 100;
                      return (
                        <AudioClip
                          key={i}
                          left={left}
                          width={width}
                          label="Music"
                          color="#5a3b82"
                        />
                      );
                    })
                  : null}
              </TrackRow>

              {/* Playhead */}
              <Playhead pct={playheadPct} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TrackRow ─────────────────────────────────────────────────────────────────

function TrackRow({ track, children }: { track: TrackDef; children?: ReactNode }) {
  return (
    <div
      className="relative border-b border-white/[0.06] bg-[#1e1e22]"
      style={{ height: track.height }}
    >
      {/* Subtle zebra */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.015] to-transparent" />
      {children}
    </div>
  );
}
