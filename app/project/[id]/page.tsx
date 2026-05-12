"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { use, useEffect, useRef, useState } from "react";
import { VideoPlayer, type VideoPlayerHandle } from "@/components/video-player";
import type { Caption } from "@/components/remotion/composition";
import type { CaptionStyle } from "@/components/remotion/caption-overlay";
import { Chat } from "@/components/chat";
import { Timeline } from "@/components/timeline";
import { EditorTopBar } from "@/components/editor-top-bar";
import { EditorLeftRail } from "@/components/editor-left-rail";
import { Loader2 } from "lucide-react";
import type { VideoSegment } from "@/components/video-player";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const projectId = id as Id<"projects">;
  const project = useQuery(api.projects.get, { projectId });

  const transcript = useQuery(
    api.transcripts.get,
    project !== undefined ? { projectId } : "skip"
  );
  const saveTranscript = useMutation(api.transcripts.save);

  const segments = useQuery(
    api.projects.listSegments,
    project !== undefined ? { projectId } : "skip"
  );

  const videoRef = useRef<VideoPlayerHandle>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(90);
  const [directorBusy, setDirectorBusy] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>("minimal");

  type Seg = { id: string; start: number; end: number; trackId?: string; text?: string; sourceStart: number; sourceEnd: number };
  const allSegs = (segments as Seg[] | undefined) ?? [];

  const captions: Caption[] = allSegs
    .filter((s) => s.trackId === "captions" && s.text)
    .map((s) => ({ start: s.start, end: s.end, text: s.text! }));

  const mainSegs: VideoSegment[] = allSegs
    .filter((s) => s.trackId === "main")
    .map((s) => ({
      id: s.id,
      timelineStart: s.start,
      sourceStart: s.sourceStart,
      sourceEnd: s.sourceEnd,
    }));

  useEffect(() => {
    if (!project?.videoUrl || transcript !== null || transcribing) return;
    // transcript === undefined means query still loading
    if (transcript === undefined) return;

    setTranscribing(true);
    fetch("/api/transcribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioUrl: project.videoUrl }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.utterances?.length > 0) {
          return saveTranscript({
            projectId,
            language: "auto",
            utterances: data.utterances,
          });
        }
      })
      .catch(console.error)
      .finally(() => setTranscribing(false));
  }, [project?.videoUrl, transcript, transcribing, projectId, saveTranscript]);

  if (project === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f11]">
        <Loader2 className="h-6 w-6 animate-spin text-white/35" />
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f11] text-white/45">
        Projet introuvable.
      </div>
    );
  }

  function seek(seconds: number) {
    videoRef.current?.seekTo(Math.min(Math.max(0, seconds), duration));
  }

  return (
    <main className="relative z-10 flex h-screen flex-col bg-[#0f0f11] text-white">
      <EditorTopBar
        projectTitle={project.title}
        directorStatus={directorBusy ? "busy" : "ready"}
        hasVideo={Boolean(project.videoUrl)}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Zone gauche : rail + vidéo + timeline */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Rail + Vidéo côte à côte */}
          <div className="flex min-h-0 min-w-0 flex-1">
            <EditorLeftRail
              projectId={projectId}
              projectTitle={project.title}
              hasVideo={Boolean(project.videoUrl)}
              captionStyle={captionStyle}
              onCaptionStyleChange={setCaptionStyle}
            />

            <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center bg-gradient-to-b from-[#111113] via-[#0e0e10] to-[#0b0b0d] px-3 py-4 md:px-6">
              <VideoPlayer
                ref={videoRef}
                videoUrl={project.videoUrl}
                captions={captions}
                captionStyle={captionStyle}
                segments={mainSegs}
                onTimeUpdate={setCurrentTime}
                onDurationChange={(d: number) => {
                  if (Number.isFinite(d) && d > 0) setDuration(d);
                }}
              />
            </div>
          </div>

          {/* Timeline pleine largeur sous rail + vidéo */}
          <div className="h-[300px] shrink-0 sm:h-[320px]">
            <Timeline
              projectId={projectId}
              currentTime={currentTime}
              duration={duration}
              hasVideo={Boolean(project.videoUrl)}
              videoUrl={project.videoUrl}
              onSeek={seek}
            />
          </div>
        </div>

        <aside className="flex h-full w-[380px] shrink-0 flex-col border-l border-white/[0.08]">
          <Chat projectId={projectId} onBusyChange={setDirectorBusy} />
        </aside>
      </div>
    </main>
  );
}
