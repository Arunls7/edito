"use client";

import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export type CaptionStyle = "minimal" | "bold" | "kinetic";

type Props = {
  text: string;
  startFrame: number;
  style: CaptionStyle;
};

export function CaptionOverlay({ text, startFrame, style }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;

  if (style === "minimal") {
    const opacity = interpolate(local, [0, 6], [0, 1], { extrapolateRight: "clamp" });
    return (
      <div
        style={{
          position: "absolute",
          bottom: "9%",
          left: "50%",
          transform: "translateX(-50%)",
          opacity,
          background: "rgba(0,0,0,0.58)",
          backdropFilter: "blur(4px)",
          padding: "10px 22px",
          borderRadius: 8,
          color: "#fff",
          fontSize: 38,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 500,
          textAlign: "center",
          maxWidth: "82%",
          lineHeight: 1.25,
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </div>
    );
  }

  if (style === "bold") {
    const s = spring({ frame: local, fps, config: { damping: 12, stiffness: 180, mass: 0.8 } });
    const scale = 0.75 + s * 0.25;
    const opacity = interpolate(local, [0, 4], [0, 1], { extrapolateRight: "clamp" });
    return (
      <div
        style={{
          position: "absolute",
          bottom: "12%",
          left: "50%",
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: "center bottom",
          opacity,
          color: "#FFE600",
          fontSize: 58,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          textAlign: "center",
          textShadow:
            "3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000",
          maxWidth: "80%",
          lineHeight: 1.1,
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </div>
    );
  }

  // kinetic
  const translateY = interpolate(local, [0, 10], [28, 0], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(local, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        bottom: "10%",
        left: "50%",
        transform: `translateX(-50%) translateY(${translateY}px)`,
        opacity,
        background:
          "linear-gradient(135deg, rgba(99,102,241,0.88) 0%, rgba(168,85,247,0.88) 100%)",
        padding: "12px 28px",
        borderRadius: 12,
        color: "#fff",
        fontSize: 46,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 700,
        textAlign: "center",
        maxWidth: "80%",
        lineHeight: 1.2,
        whiteSpace: "pre-wrap",
        boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
      }}
    >
      {text}
    </div>
  );
}
