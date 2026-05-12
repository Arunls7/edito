"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { use, useEffect, useRef, useState } from "react";
import { VideoPlayer } from "@/components/video-player";
import { Chat } from "@/components/chat";
import { Timeline } from "@/components/timeline";
import { EditorTopBar } from "@/components/editor-top-bar";
import { EditorLeftRail } from "@/components/editor-left-rail";
import { Loader2 } from "lucide-react";

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

  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(90);
  const [directorBusy, setDirectorBusy] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

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
    const v = videoRef.current;
    if (!v) return;
    const d =
      v.duration && Number.isFinite(v.duration) ? v.duration : duration;
    v.currentTime = Math.min(Math.max(0, seconds), d > 0 ? d : seconds);
  }

  return (
    <main className="relative z-10 flex h-screen flex-col bg-[#0f0f11] text-white">
      <EditorTopBar
        projectTitle={project.title}
        directorStatus={directorBusy ? "busy" : "ready"}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Zone gauche : rail + vidéo + timeline */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Rail + Vidéo côte à côte */}
          <div className="flex min-h-0 min-w-0 flex-1">
            <EditorLeftRail
              projectTitle={project.title}
              hasVideo={Boolean(project.videoUrl)}
            />

            <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center bg-gradient-to-b from-[#111113] via-[#0e0e10] to-[#0b0b0d] px-3 py-4 md:px-6">
              <VideoPlayer
                ref={videoRef}
                videoUrl={project.videoUrl}
                onTimeUpdate={setCurrentTime}
                onDurationChange={(d: number) => {
                  if (Number.isFinite(d) && d > 0) setDuration(d);
                }}
              />
            </div>
          </div>

          {/* Timeline pleine largeur sous rail + vidéo */}
          <div className="h-[200px] shrink-0 sm:h-[220px]">
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
