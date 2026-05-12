"use client";

import { AbsoluteFill, Video, useCurrentFrame, useVideoConfig } from "remotion";
import { CaptionOverlay, type CaptionStyle } from "./caption-overlay";

export type Caption = {
  start: number;
  end: number;
  text: string;
};

export type CompositionProps = {
  videoUrl: string;
  captions?: Caption[];
  captionStyle?: CaptionStyle;
};

export function VideoComposition({
  videoUrl,
  captions = [],
  captionStyle = "minimal",
}: CompositionProps) {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const currentTime = frame / fps;

  const active = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Video src={videoUrl} />
      {active && (
        <CaptionOverlay
          text={active.text}
          startFrame={Math.round(active.start * fps)}
          style={captionStyle}
        />
      )}
    </AbsoluteFill>
  );
}
