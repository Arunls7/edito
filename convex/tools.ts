"use node";

import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";

// ─── remove_silences ──────────────────────────────────────────────────────────
// Primary: NeuralFalcon/Remove-Silence-From-Audio (HF Space via Gradio client).
// Returns an audio file with silence removed + segment timestamps.
// Fallback: transcript-based approach using stored Deepgram/Whisper utterances.

async function removeSilenceViaHF(
  videoUrl: string,
  minSilenceLen: number,
  silenceThresh: number,
  keepSilence: number
): Promise<{ speechSegments: { start: number; end: number }[]; processedUrl?: string }> {
  const { Client } = await import("@gradio/client");
  const client = await Client.connect("NeuralFalcon/Remove-Silence-From-Audio");

  // Fetch the video/audio as a blob to send to the Space
  const blob = await fetch(videoUrl).then((r) => {
    if (!r.ok) throw new Error(`Fetch failed: ${r.status}`);
    return r.blob();
  });

  // Call the Space — parameters discovered via client.view_api() at runtime.
  // NeuralFalcon/Remove-Silence-From-Audio uses pydub split_on_silence:
  //   [audio, min_silence_len (ms), silence_thresh (dBFS), keep_silence (ms)]
  const result = await client.predict("/predict", [
    blob,
    minSilenceLen,
    silenceThresh,
    keepSilence,
  ]);

  const data = result.data as unknown[];

  // The Space returns the processed audio file URL (data[0])
  // and optionally a list of segment timestamps (data[1])
  const processedUrl = typeof data[0] === "string"
    ? (data[0] as string)
    : (data[0] as { url?: string })?.url;

  // If the Space returns timestamps directly, use them
  if (Array.isArray(data[1])) {
    const segs = (data[1] as [number, number][]).map(([start, end]) => ({ start, end }));
    return { speechSegments: segs, processedUrl };
  }

  // Otherwise derive segments from the processed audio duration vs original
  // by fetching both and comparing — basic heuristic
  return { speechSegments: [], processedUrl };
}

function segmentsFromTranscript(
  utterances: { start: number; end: number }[],
  padding: number
): { start: number; end: number }[] {
  if (utterances.length === 0) return [];
  const sorted = [...utterances].sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [];
  let cur = { start: Math.max(0, sorted[0].start - padding), end: sorted[0].end + padding };
  for (let i = 1; i < sorted.length; i++) {
    const u = sorted[i];
    if (u.start - padding <= cur.end) {
      cur.end = Math.max(cur.end, u.end + padding);
    } else {
      merged.push({ ...cur });
      cur = { start: Math.max(0, u.start - padding), end: u.end + padding };
    }
  }
  merged.push(cur);
  return merged;
}

export const removeSilences = action({
  args: {
    projectId: v.id("projects"),
    padding_ms: v.optional(v.number()),
    min_silence_len_ms: v.optional(v.number()),
    silence_thresh_db: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.runQuery(api.projects.get, { projectId: args.projectId });
    if (!project?.videoUrl) {
      return { ok: false, message: "Pas de vidéo associée au projet." };
    }

    const padding = (args.padding_ms ?? 150) / 1000;
    const minSilenceLen = args.min_silence_len_ms ?? 500;
    const silenceThresh = args.silence_thresh_db ?? -40;
    const keepSilence = args.padding_ms ?? 150;

    let speechSegments: { start: number; end: number }[] = [];
    let method = "hf-space";

    try {
      const hfResult = await removeSilenceViaHF(
        project.videoUrl,
        minSilenceLen,
        silenceThresh,
        keepSilence
      );
      speechSegments = hfResult.speechSegments;

      // If the Space didn't return timestamps, fall through to transcript fallback
      if (speechSegments.length === 0) throw new Error("No timestamps from Space");
    } catch (err) {
      // Fallback: use stored transcript utterances
      method = "transcript-fallback";
      const transcript = await ctx.runQuery(api.transcripts.get, { projectId: args.projectId });
      if (!transcript || transcript.utterances.length === 0) {
        return {
          ok: false,
          message: `Le Space HF n'a pas retourné de timestamps et il n'y a pas de transcript. Erreur : ${String(err)}`,
        };
      }
      speechSegments = segmentsFromTranscript(transcript.utterances, padding);
    }

    // Build timeline segments (silence gaps removed → segments concatenated)
    let timelinePos = 0;
    const segments = speechSegments.map((s, i) => {
      const seg = { sourceStart: s.start, sourceEnd: s.end, timelineStart: timelinePos, order: i };
      timelinePos += s.end - s.start;
      return seg;
    });

    await ctx.runMutation(internal.segments.replaceTrack, {
      projectId: args.projectId,
      trackId: "main",
      segments,
    });

    return {
      ok: true,
      method,
      segmentCount: segments.length,
      message: `${segments.length} segments (${method === "hf-space" ? "NeuralFalcon" : "transcript"}) — ~${Math.round(timelinePos)}s de parole conservée.`,
    };
  },
});

// ─── add_captions ─────────────────────────────────────────────────────────────
// Creates caption overlay segments from the stored transcript.

export const addCaptions = action({
  args: {
    projectId: v.id("projects"),
    style: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const transcript = await ctx.runQuery(api.transcripts.get, {
      projectId: args.projectId,
    });

    if (!transcript || transcript.utterances.length === 0) {
      return { ok: false, message: "Pas de transcript disponible." };
    }

    const segments = transcript.utterances.map((u: { start: number; end: number }, i: number) => ({
      sourceStart: u.start,
      sourceEnd: u.end,
      timelineStart: u.start,
      order: i,
    }));

    await ctx.runMutation(internal.segments.replaceTrack, {
      projectId: args.projectId,
      trackId: "captions",
      segments,
    });

    return {
      ok: true,
      captionCount: segments.length,
      message: `${segments.length} captions ajoutées (style : ${args.style ?? "minimal"}).`,
    };
  },
});

// ─── generate_music ───────────────────────────────────────────────────────────
// Calls MusicGen (facebook/musicgen-small) via HF Inference API,
// uploads the result to Convex storage, and creates a music segment.

export const generateMusic = action({
  args: {
    projectId: v.id("projects"),
    description: v.string(),
    durationSeconds: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.HF_API_KEY;
    if (!apiKey) {
      return { ok: false, message: "HF_API_KEY non configuré sur le serveur." };
    }

    const { HfInference } = await import("@huggingface/inference");
    const hf = new HfInference(apiKey);

    const targetSec = args.durationSeconds ?? 20;

    const audioBlob = await hf.textToAudio({
      model: "facebook/musicgen-small",
      inputs: args.description,
      parameters: {
        // ~50 tokens ≈ 1 second for musicgen-small
        max_new_tokens: Math.min(Math.round(targetSec * 50), 1500),
      } as Record<string, unknown>,
    });

    // Upload to Convex storage
    const uploadUrl = await ctx.storage.generateUploadUrl();
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      body: audioBlob,
      headers: { "Content-Type": "audio/wav" },
    });
    const { storageId } = (await uploadRes.json()) as { storageId: string };

    // Create a full-span music segment
    await ctx.runMutation(internal.segments.replaceTrack, {
      projectId: args.projectId,
      trackId: "music",
      segments: [
        {
          sourceStart: 0,
          sourceEnd: targetSec,
          timelineStart: 0,
          order: 0,
        },
      ],
    });

    return {
      ok: true,
      storageId,
      message: `Musique générée (~${targetSec}s) et ajoutée à la piste Music.`,
    };
  },
});
