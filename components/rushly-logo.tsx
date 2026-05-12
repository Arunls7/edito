"use client";

export function RushlyLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const scale = size === "sm" ? 0.5 : size === "lg" ? 1.4 : 0.8;
  const fontSize = 80 * scale;
  const timelineH = 18 * scale;
  const gap = 4 * scale;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <style>{`
        @keyframes rushly-scrub{0%,100%{left:0%}50%{left:calc(100% - 2px)}}
        @keyframes rushly-tw{0%,100%{opacity:.4;transform:scale(.75)}50%{opacity:1;transform:scale(1.1)}}
        .rushly-ph{animation:rushly-scrub 3.6s cubic-bezier(.45,0,.55,1) infinite}
        .rushly-spk{animation:rushly-tw 2.4s ease-in-out infinite}
      `}</style>

      {/* Stars */}
      <svg viewBox="-10 -10 20 20" className="rushly-spk" style={{ position: "absolute", top: -38 * scale, left: "36%", width: 22 * scale, height: 22 * scale, animationDelay: ".4s", overflow: "visible" }}>
        <path d="M 0,-9 L 1.5,-1.5 L 9,0 L 1.5,1.5 L 0,9 L -1.5,1.5 L -9,0 L -1.5,-1.5 Z" fill="#F2553C" />
      </svg>
      <svg viewBox="-10 -10 20 20" className="rushly-spk" style={{ position: "absolute", top: 14 * scale, right: -30 * scale, width: 14 * scale, height: 14 * scale, animationDelay: "1.1s", overflow: "visible" }}>
        <path d="M 0,-9 L 1.5,-1.5 L 9,0 L 1.5,1.5 L 0,9 L -1.5,1.5 L -9,0 L -1.5,-1.5 Z" fill="#7C3AED" />
      </svg>
      <svg viewBox="-10 -10 20 20" className="rushly-spk" style={{ position: "absolute", bottom: -34 * scale, left: "6%", width: 12 * scale, height: 12 * scale, animationDelay: ".8s", overflow: "visible" }}>
        <path d="M 0,-9 L 1.5,-1.5 L 9,0 L 1.5,1.5 L 0,9 L -1.5,1.5 L -9,0 L -1.5,-1.5 Z" fill="#F2553C" />
      </svg>

      {/* Wordmark */}
      <div style={{ fontSize, fontWeight: 500, color: "#f5f5f7", letterSpacing: -3.2 * scale, lineHeight: 1, fontFamily: "inherit" }}>
        Rushly
      </div>

      {/* Timeline */}
      <div style={{ display: "flex", gap, marginTop: 18 * scale, height: timelineH, position: "relative" }}>
        <div style={{ background: "#F2553C", flex: 22, borderRadius: 3 * scale }} />
        <div style={{ background: "#7C3AED", flex: 28, borderRadius: 3 * scale }} />
        <div style={{ background: "#10B981", flex: 14, borderRadius: 3 * scale }} />
        <div style={{ background: "#F59E0B", flex: 20, borderRadius: 3 * scale }} />
        <div style={{ background: "#3B82F6", flex: 13, borderRadius: 3 * scale }} />

        {/* Playhead */}
        <div className="rushly-ph" style={{ position: "absolute", top: -14 * scale, bottom: -14 * scale, width: 2, background: "#F2553C" }}>
          <svg viewBox="-10 -10 20 20" className="rushly-spk" style={{ position: "absolute", top: -16 * scale, left: -13 * scale, width: 28 * scale, height: 28 * scale, overflow: "visible" }}>
            <path d="M 0,-9 L 1.5,-1.5 L 9,0 L 1.5,1.5 L 0,9 L -1.5,1.5 L -9,0 L -1.5,-1.5 Z" fill="#F2553C" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function RushlyWordmark({ className }: { className?: string }) {
  return (
    <span className={className} style={{ fontWeight: 600, letterSpacing: "-0.03em" }}>
      Rushly
    </span>
  );
}
