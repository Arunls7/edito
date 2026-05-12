"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Player, type PlayerRef } from "@remotion/player";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Pause,
  Play,
  Volume2,
  Maximize,
  Minimize,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  VideoComposition,
  type Caption,
  type CompositionProps,
} from "./remotion/composition";
import type { CaptionStyle } from "./remotion/caption-overlay";

// ─── Public handle ────────────────────────────────────────────────────────────

export type VideoPlayerHandle = {
  seekTo: (seconds: number) => void;
};

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  videoUrl: string | null;
  captions?: Caption[];
  captionStyle?: CaptionStyle;
  onTimeUpdate?: (t: number) => void;
  onDurationChange?: (d: number) => void;
};

const FPS = 30;

function fmt(t: number) {
  if (!Number.isFinite(t)) return "00:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── VideoPlayer ──────────────────────────────────────────────────────────────

export const VideoPlayer = forwardRef<VideoPlayerHandle, Props>(
  function VideoPlayer(
    { videoUrl, captions = [], captionStyle = "minimal", onTimeUpdate, onDurationChange },
    ref
  ) {
    const playerRef = useRef<PlayerRef>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Native video dimensions + duration (detected via hidden <video>)
    const [dims, setDims] = useState<{
      width: number;
      height: number;
      duration: number;
    } | null>(null);

    // Available pixel space from the wrapper (ResizeObserver)
    const [avail, setAvail] = useState<{ w: number; h: number } | null>(null);

    const [currentTime, setCurrentTime] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [fs, setFs] = useState(false);

    // ── Observe wrapper size ─────────────────────────────────────────────────
    useEffect(() => {
      const el = wrapperRef.current;
      if (!el) return;
      const ro = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) setAvail({ w: width, h: height });
      });
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    // ── Detect video dimensions ──────────────────────────────────────────────
    useEffect(() => {
      if (!videoUrl) return;
      setDims(null);
      const v = document.createElement("video");
      v.src = videoUrl;
      v.preload = "metadata";
      v.onloadedmetadata = () => {
        const d = {
          width: v.videoWidth || 1920,
          height: v.videoHeight || 1080,
          duration: v.duration,
        };
        setDims(d);
        onDurationChange?.(d.duration);
      };
      return () => { v.src = ""; };
    }, [videoUrl, onDurationChange]);

    // ── Compute exact display size (object-fit: contain logic) ───────────────
    const display = useMemo(() => {
      if (!avail || !dims || avail.w === 0 || avail.h === 0) return null;
      const videoRatio = dims.width / dims.height;
      const containerRatio = avail.w / avail.h;
      if (videoRatio < containerRatio) {
        // Taller than container → height-constrained (portrait)
        const h = avail.h;
        return { w: Math.round(h * videoRatio), h };
      } else {
        // Wider than container → width-constrained (landscape)
        const w = avail.w;
        return { w, h: Math.round(w / videoRatio) };
      }
    }, [avail, dims]);

    // ── Expose seekTo ────────────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        playerRef.current?.seekTo(Math.round(seconds * FPS));
      },
    }), []);

    // ── Poll current time ────────────────────────────────────────────────────
    useEffect(() => {
      if (!dims) return;
      const id = window.setInterval(() => {
        const frame = playerRef.current?.getCurrentFrame();
        if (frame != null) {
          const t = frame / FPS;
          setCurrentTime(t);
          onTimeUpdate?.(t);
        }
      }, 80);
      return () => window.clearInterval(id);
    }, [dims, onTimeUpdate]);

    // ── Play/pause/ended events ──────────────────────────────────────────────
    useEffect(() => {
      if (!display) return;
      const p = playerRef.current;
      if (!p) return;
      const onPlay = () => setPlaying(true);
      const onPause = () => setPlaying(false);
      const onEnded = () => setPlaying(false);
      p.addEventListener("play", onPlay);
      p.addEventListener("pause", onPause);
      p.addEventListener("ended", onEnded);
      return () => {
        p.removeEventListener("play", onPlay);
        p.removeEventListener("pause", onPause);
        p.removeEventListener("ended", onEnded);
      };
    }, [display]);

    // ── Render ───────────────────────────────────────────────────────────────

    // Outer wrapper always present so ResizeObserver fires immediately
    return (
      <div
        ref={wrapperRef}
        className="flex h-full w-full items-center justify-center"
      >
        {!videoUrl && (
          <div className="flex aspect-video w-full max-w-2xl items-center justify-center rounded-2xl border border-white/[0.08] bg-[#1a1a1e] text-sm text-white/45">
            Vidéo en cours de traitement…
          </div>
        )}

        {videoUrl && (!dims || !display) && (
          <div className="flex aspect-video w-full max-w-2xl items-center justify-center rounded-2xl bg-black text-sm text-white/30">
            Chargement…
          </div>
        )}

        {videoUrl && dims && display && (() => {
          const durationInFrames = Math.max(1, Math.round(dims.duration * FPS));
          const inputProps: CompositionProps = { videoUrl, captions, captionStyle };

          return (
            <div
              style={{ width: display.w, height: display.h }}
              className={cn(
                "relative overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/[0.07]",
                fs && "!h-full !w-full rounded-none ring-0"
              )}
            >
              <Player
                ref={playerRef}
                component={VideoComposition}
                durationInFrames={durationInFrames}
                fps={FPS}
                compositionWidth={dims.width}
                compositionHeight={dims.height}
                inputProps={inputProps}
                controls={false}
                clickToPlay
                doubleClickToFullscreen={false}
                acknowledgeRemotionLicense
                style={{ width: "100%", height: "100%", display: "block" }}
              />

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pt-16 pb-1">
                <div className="pointer-events-auto space-y-2 px-3 pb-3 md:px-4">
                  <VideoChrome
                    currentTime={currentTime}
                    duration={dims.duration}
                    playing={playing}
                    muted={muted}
                    fullscreen={fs}
                    onTogglePlay={() => {
                      if (playing) playerRef.current?.pause();
                      else playerRef.current?.play();
                    }}
                    onSeek={(delta) => {
                      const next = Math.min(Math.max(0, currentTime + delta), dims.duration);
                      playerRef.current?.seekTo(Math.round(next * FPS));
                    }}
                    onSeekAbsolute={(pct) => {
                      playerRef.current?.seekTo(Math.round(pct * durationInFrames));
                    }}
                    onGoStart={() => playerRef.current?.seekTo(0)}
                    onGoEnd={() => playerRef.current?.seekTo(durationInFrames - 1)}
                    onMuteToggle={() => setMuted((m) => !m)}
                    onToggleFs={() => {
                      if (!fs) {
                        playerRef.current?.requestFullscreen();
                        setFs(true);
                      } else {
                        void document.exitFullscreen?.();
                        setFs(false);
                      }
                    }}
                    fmt={fmt}
                  />
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }
);

// ─── VideoChrome ──────────────────────────────────────────────────────────────

function VideoChrome({
  currentTime,
  duration,
  playing,
  muted,
  fullscreen,
  onTogglePlay,
  onSeek,
  onSeekAbsolute,
  onGoStart,
  onGoEnd,
  onMuteToggle,
  onToggleFs,
  fmt,
}: {
  currentTime: number;
  duration: number;
  playing: boolean;
  muted: boolean;
  fullscreen: boolean;
  onTogglePlay: () => void;
  onSeek: (delta: number) => void;
  onSeekAbsolute: (pct: number) => void;
  onGoStart: () => void;
  onGoEnd: () => void;
  onMuteToggle: () => void;
  onToggleFs: () => void;
  fmt: (t: number) => string;
}) {
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  function onBarClick(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    onSeekAbsolute((e.clientX - rect.left) / rect.width);
  }

  function onBarKey(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onTogglePlay();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onBarClick}
        onKeyDown={onBarKey}
        className="group relative h-1.5 w-full cursor-pointer rounded-full bg-white/15 outline-none ring-offset-2 ring-offset-black focus-visible:ring-2 focus-visible:ring-white/40"
        aria-label="Seek timeline"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white/85 transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </button>

      <div className="flex items-center justify-between gap-3 pt-1 text-xs text-white/75">
        <span className="tabular-nums">
          {fmt(currentTime)}{" "}
          <span className="text-white/40">/ {fmt(duration)}</span>
        </span>

        <div className="flex flex-1 items-center justify-center gap-0.5 sm:gap-1">
          <IconBtn label="Start" onClick={onGoStart}>
            <ChevronsLeft className="h-5 w-5" />
          </IconBtn>
          <IconBtn label="-5s" onClick={() => onSeek(-5)}>
            <ChevronLeft className="h-5 w-5" />
          </IconBtn>
          <button
            type="button"
            onClick={onTogglePlay}
            className="mx-1 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg shadow-black/50 transition hover:bg-white/95"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <Pause className="h-5 w-5" fill="currentColor" />
            ) : (
              <Play className="h-5 w-5 pl-0.5" fill="currentColor" />
            )}
          </button>
          <IconBtn label="+5s" onClick={() => onSeek(5)}>
            <ChevronRight className="h-5 w-5" />
          </IconBtn>
          <IconBtn label="End" onClick={onGoEnd}>
            <ChevronsRight className="h-5 w-5" />
          </IconBtn>
        </div>

        <div className="flex items-center gap-3 text-white/55">
          <button
            type="button"
            className="rounded-md p-1.5 hover:bg-white/10 hover:text-white"
            aria-label={muted ? "Unmute" : "Mute"}
            onClick={onMuteToggle}
          >
            <Volume2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-md p-1.5 hover:bg-white/10 hover:text-white"
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            onClick={onToggleFs}
          >
            {fullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}

function IconBtn({
  children,
  onClick,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}
