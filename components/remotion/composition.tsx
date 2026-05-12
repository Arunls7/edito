"use client";

import { AbsoluteFill, Sequence, Video, useCurrentFrame, useVideoConfig } from "remotion";
import { CaptionOverlay, type CaptionStyle } from "./caption-overlay";

export type Caption = {
  start: number;
  end: number;
  text: string;
};

export type VideoSegment = {
  id: string;
  timelineStart: number;
  sourceStart: number;
  sourceEnd: number;
};

export type CompositionProps = {
  videoUrl: string;
  captions?: Caption[];
  captionStyle?: CaptionStyle;
  segments?: VideoSegment[];
};

export function VideoComposition({
  videoUrl,
  captions = [],
  captionStyle = "minimal",
  segments = [],
}: CompositionProps) {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const currentTime = frame / fps;

  const active = captions.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {segments.length === 0 ? (
        // No edit yet — play full source video
        <Video src={videoUrl} />
      ) : (
        // Multi-segment edit: each clip positioned with Sequence + startFrom
        segments.map((seg, i) => {
          const from = Math.round(seg.timelineStart * fps);
          const sourceStartFrames = Math.round(seg.sourceStart * fps);
          const clipDurationFrames = Math.max(
            1,
            Math.round((seg.sourceEnd - seg.sourceStart) * fps)
          );
          return (
            <Sequence key={seg.id || i} from={from} durationInFrames={clipDurationFrames}>
              <Video src={videoUrl} startFrom={sourceStartFrames} />
            </Sequence>
          );
        })
      )}

      {active && (
        <CaptionOverlay
          key={active.start}
          text={active.text}
          startFrame={Math.round(active.start * fps)}
          style={captionStyle}
        />
      )}
    </AbsoluteFill>
  );
}
