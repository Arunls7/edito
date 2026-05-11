"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
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

type Props = {
  videoUrl: string | null;
  onTimeUpdate?: (t: number) => void;
  onDurationChange?: (d: number) => void;
};

export const VideoPlayer = forwardRef<HTMLVideoElement, Props>(
  function VideoPlayer({ videoUrl, onTimeUpdate, onDurationChange }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(false);
    const [zoomPct] = useState(100);
    const [fs, setFs] = useState(false);

    useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement, []);

    useEffect(() => {
      const onFs = () =>
        setFs(Boolean(document.fullscreenElement === containerRef.current));
      document.addEventListener("fullscreenchange", onFs);
      return () => document.removeEventListener("fullscreenchange", onFs);
    }, []);

    function toggleFs() {
      const el = containerRef.current;
      if (!el) return;
      if (!document.fullscreenElement) {
        void el.requestFullscreen?.();
      } else {
        void document.exitFullscreen?.();
      }
    }

    function fmt(t: number) {
      if (!Number.isFinite(t)) return "00:00";
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }

    if (!videoUrl) {
      return (
        <div className="flex aspect-video w-full max-w-5xl items-center justify-center rounded-2xl border border-white/[0.08] bg-[#1a1a1e] text-sm text-white/45 shadow-2xl ring-1 ring-black/40">
          Vidéo en cours de traitement…
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative w-full max-w-5xl overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/[0.07]",
          fs && "flex max-h-none max-w-none flex-1 rounded-none ring-0",
        )}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          className="aspect-video w-full object-contain"
          playsInline
          muted={muted}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => onTimeUpdate?.(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            onDurationChange?.(e.currentTarget.duration);
            onTimeUpdate?.(0);
          }}
          onEnded={() => setPlaying(false)}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pt-16 pb-1">
          <div className="pointer-events-auto space-y-2 px-3 pb-3 md:px-4">
            <VideoChrome
              videoRef={videoRef}
              playing={playing}
              muted={muted}
              setMuted={setMuted}
              zoomPct={zoomPct}
              onTogglePlay={() => {
                const v = videoRef.current;
                if (!v) return;
                if (v.paused) void v.play();
                else v.pause();
              }}
              onSeek={(delta) => {
                const v = videoRef.current;
                if (!v || !Number.isFinite(v.duration)) return;
                v.currentTime = Math.min(
                  Math.max(0, v.currentTime + delta),
                  v.duration,
                );
              }}
              onGoStart={() => {
                const v = videoRef.current;
                if (v) v.currentTime = 0;
              }}
              onGoEnd={() => {
                const v = videoRef.current;
                if (v && Number.isFinite(v.duration)) v.currentTime = v.duration;
              }}
              fmt={fmt}
              toggleFs={toggleFs}
              fullscreen={fs}
            />
          </div>
        </div>
      </div>
    );
  },
);

function VideoChrome({
  videoRef,
  playing,
  muted,
  setMuted,
  zoomPct,
  onTogglePlay,
  onSeek,
  onGoStart,
  onGoEnd,
  fmt,
  toggleFs,
  fullscreen,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  playing: boolean;
  muted: boolean;
  setMuted: (m: boolean) => void;
  zoomPct: number;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onGoStart: () => void;
  onGoEnd: () => void;
  fmt: (t: number) => string;
  toggleFs: () => void;
  fullscreen: boolean;
}) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => tick((x) => x + 1), 250);
    return () => window.clearInterval(id);
  }, []);

  const v = videoRef.current;
  const cur = v?.currentTime ?? 0;
  const dur = v?.duration && Number.isFinite(v.duration) ? v.duration : 0;
  const pct = dur > 0 ? (cur / dur) * 100 : 0;

  function onBarClick(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const p = x / rect.width;
    if (v && dur > 0) v.currentTime = p * dur;
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
          {fmt(cur)}{" "}
          <span className="text-white/40">/ {fmt(dur)}</span>
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
          <span className="hidden tabular-nums sm:inline">{zoomPct}%</span>
          <button
            type="button"
            className="rounded-md p-1.5 hover:bg-white/10 hover:text-white"
            aria-label={muted ? "Unmute" : "Mute"}
            onClick={() => setMuted(!muted)}
          >
            <Volume2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-md p-1.5 hover:bg-white/10 hover:text-white"
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            onClick={toggleFs}
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
