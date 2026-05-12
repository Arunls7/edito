"use node";

import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";

// ─── remove_silences ──────────────────────────────────────────────────────────
// Uses the Deepgram/Whisper transcript already stored in DB.
// Merges nearby utterances (configurable padding), removes silence gaps,
// and writes the result as "main" track segments.

export const removeSilences = action({
  args: {
    projectId: v.id("projects"),
    padding_ms: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const transcript = await ctx.runQuery(api.transcripts.get, {
      projectId: args.projectId,
    });

    if (!transcript || transcript.utterances.length === 0) {
      return {
        ok: false,
        message: "Pas de transcript — la vidéo doit être transcrite d'abord.",
      };
    }

    const padding = (args.padding_ms ?? 150) / 1000;
    const utts = [...transcript.utterances].sort((a, b) => a.start - b.start);

    // Merge utterances that are close together
    const merged: { start: number; end: number }[] = [];
    let cur = {
      start: Math.max(0, utts[0].start - padding),
      end: utts[0].end + padding,
    };
    for (let i = 1; i < utts.length; i++) {
      const u = utts[i];
      if (u.start - padding <= cur.end) {
        cur.end = Math.max(cur.end, u.end + padding);
      } else {
        merged.push({ ...cur });
        cur = { start: Math.max(0, u.start - padding), end: u.end + padding };
      }
    }
    merged.push(cur);

    // Compute timeline positions: silence gaps are removed → segments concatenated
    let timelinePos = 0;
    const segments = merged.map((s, i) => {
      const seg = {
        sourceStart: s.start,
        sourceEnd: s.end,
        timelineStart: timelinePos,
        order: i,
      };
      timelinePos += s.end - s.start;
      return seg;
    });

    await ctx.runMutation(internal.segments.replaceTrack, {
      projectId: args.projectId,
      trackId: "main",
      segments,
    });

    const removedSec = Math.round(
      (utts[utts.length - 1].end - utts[0].start) - timelinePos
    );

    return {
      ok: true,
      segmentCount: segments.length,
      message: `${segments.length} segments créés, ~${removedSec}s de silence retiré.`,
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

    const segments = transcript.utterances.map((u, i) => ({
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
