"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// ─── Mock data ────────────────────────────────────────────────────────────────

const DURATION = 75; // seconds

const MOCK_BROLL = [
  { start: 6, end: 27 },
];

const MOCK_MAIN = [
  { start: 0, end: 32, label: "Intro" },
  { start: 38, end: 62, label: "Action" },
  { start: 66, end: 75, label: "Outro" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toTimecode(s: number) {
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  const ff = Math.floor((s % 1) * 30);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}:${String(ff).padStart(2, "0")}`;
}

function formatTick(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TrackSlot({ height, children }: { height: number; children: ReactNode }) {
  return (
    <div className="relative rounded-md bg-[#18181c]/90 ring-1 ring-white/[0.06]" style={{ height }}>
      {children}
    </div>
  );
}

function Clip({
  start,
  end,
  duration,
  color,
  label,
  thumbGradient,
}: {
  start: number;
  end: number;
  duration: number;
  color: string;
  label?: string;
  thumbGradient?: string;
}) {
  const left = (start / duration) * 100;
  const width = ((end - start) / duration) * 100;
  return (
    <div
      className="absolute top-1.5 bottom-1.5 rounded-md overflow-hidden ring-1 ring-white/[0.12]"
      style={{ left: `${left}%`, width: `${width}%` }}
    >
      <div className={`absolute inset-0 ${thumbGradient ?? color}`} />
      <div className="absolute inset-0 bg-black/25" />
      {label && (
        <span className="absolute bottom-1 left-2 text-[10px] font-medium text-white/60 truncate">
          {label}
        </span>
      )}
    </div>
  );
}

function Waveform({ duration, currentTime }: { duration: number; currentTime: number }) {
  const bars = 64;
  const progress = currentTime / duration;
  return (
    <div className="flex h-full items-center gap-[2px] px-2">
      {Array.from({ length: bars }).map((_, i) => {
        const h = 18 + Math.sin(i * 0.7) * 13 + Math.sin(i * 0.23) * 7 + ((i * 11) % 8);
        const played = i / bars < progress;
        return (
          <div
            key={i}
            className={`w-[3px] shrink-0 rounded-full transition-colors ${
              played
                ? "bg-gradient-to-t from-violet-400 to-violet-300/80"
                : "bg-gradient-to-t from-violet-400/40 to-white/20"
            }`}
            style={{ height: `${h}%` }}
          />
        );
      })}
    </div>
  );
}

// ─── Main demo ────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [currentTime, setCurrentTime] = useState(18);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    function tick(ts: number) {
      if (lastRef.current !== null) {
        const dt = (ts - lastRef.current) / 1000;
        setCurrentTime((t) => {
          const next = t + dt;
          return next >= DURATION ? 0 : next;
        });
      }
      lastRef.current = ts;
      rafRef.current = requestAnimationFrame(tick);
    }
    lastRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing]);

  const playheadPct = (currentTime / DURATION) * 100;
  const step = 15;
  const ticks: number[] = [];
  for (let t = 0; t <= DURATION + step; t += step) ticks.push(t);

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white flex flex-col items-center justify-center p-8 gap-6">
      <h1 className="text-sm font-mono text-white/40 tracking-widest uppercase">
        Timeline preview — demo
      </h1>

      {/* ── Timeline ── */}
      <div className="w-full max-w-5xl rounded-xl border border-white/[0.08] bg-[#101012] overflow-hidden shadow-2xl">
        <div className="flex overflow-hidden" style={{ height: 220 }}>

          {/* Left labels */}
          <div className="flex w-[110px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0d0d0f]">
            <div
              className="flex h-8 items-center justify-center border-b border-white/[0.06] cursor-pointer select-none"
              onClick={() => setPlaying((p) => !p)}
              title={playing ? "Pause" : "Play"}
            >
              <span className="font-mono text-[11px] tabular-nums text-white/70 tracking-tight">
                {toTimecode(currentTime)}
              </span>
            </div>
            {["B-roll", "Main", "Music"].map((label) => (
              <div
                key={label}
                className="flex items-center px-3 text-[10px] font-semibold uppercase tracking-wider text-white/35"
                style={{ height: 52 }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Track area */}
          <div className="relative min-w-0 flex-1 overflow-x-auto">
            <div className="relative min-w-[640px] px-3 pb-3 pt-0">

              {/* Ruler */}
              <div className="relative mb-2 flex h-8 select-none items-end border-b border-white/[0.06] pb-1">
                {ticks.map((t) => (
                  <div
                    key={t}
                    className="absolute bottom-1 flex flex-col items-center"
                    style={{ left: `${(t / DURATION) * 100}%` }}
                  >
                    <div className="h-1.5 w-px bg-white/20 mb-0.5" />
                    <span className="text-[10px] tabular-nums text-white/40">
                      {formatTick(t)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tracks */}
              <div className="space-y-2">
                {/* B-roll */}
                <TrackSlot height={52}>
                  {MOCK_BROLL.map((s, i) => (
                    <Clip
                      key={i}
                      start={s.start}
                      end={s.end}
                      duration={DURATION}
                      color=""
                      thumbGradient="bg-gradient-to-b from-slate-400/25 to-slate-600/10"
                    />
                  ))}
                </TrackSlot>

                {/* Main */}
                <TrackSlot height={52}>
                  {MOCK_MAIN.map((s, i) => (
                    <Clip
                      key={i}
                      start={s.start}
                      end={s.end}
                      duration={DURATION}
                      color=""
                      thumbGradient="bg-gradient-to-b from-sky-400/30 to-sky-600/10"
                      label={s.label}
                    />
                  ))}
                </TrackSlot>

                {/* Music */}
                <TrackSlot height={52}>
                  <Waveform duration={DURATION} currentTime={currentTime} />
                </TrackSlot>
              </div>

              {/* Playhead */}
              <div
                className="pointer-events-none absolute bottom-0 top-0 z-10 w-px -translate-x-1/2 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                style={{ left: `calc(${playheadPct}% + 12px)` }}
              >
                <div className="absolute top-[28px] left-1/2 h-0 w-0 -translate-x-1/2 border-x-[5px] border-b-[6px] border-x-transparent border-b-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls hint */}
      <p className="text-[11px] text-white/30">
        Clique sur le timecode pour {playing ? "pauser" : "lancer"} la lecture démo
      </p>
    </div>
  );
}
