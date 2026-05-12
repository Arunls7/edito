import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";
import { hasFullClerkConfig } from "@/lib/clerk-config";
import { auth } from "@clerk/nextjs/server";

type Utterance = { start: number; end: number; text: string; confidence: number };

// ─── Deepgram ─────────────────────────────────────────────────────────────────

async function transcribeWithDeepgram(audioUrl: string): Promise<Utterance[]> {
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
  const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
    { url: audioUrl },
    {
      model: "nova-3",
      smart_format: true,
      punctuate: true,
      utterances: true,
      detect_language: true,
    }
  );
  if (error) throw new Error(`Deepgram: ${error.message}`);
  return (result?.results?.utterances ?? []).map((u) => ({
    start: u.start,
    end: u.end,
    text: u.transcript,
    confidence: u.confidence,
  }));
}

// ─── HF Whisper (fallback) ────────────────────────────────────────────────────

async function transcribeWithWhisper(audioUrl: string): Promise<Utterance[]> {
  const { HfInference } = await import("@huggingface/inference");
  const hf = new HfInference(process.env.HF_API_KEY);

  // Fetch the audio/video file
  const blob = await fetch(audioUrl).then((r) => {
    if (!r.ok) throw new Error(`Fetch audio failed: ${r.status}`);
    return r.blob();
  });

  const result = await (hf.automaticSpeechRecognition as Function)({
    model: "openai/whisper-large-v3",
    data: blob,
    parameters: { return_timestamps: true },
  });

  // HF returns chunks with [start, end] timestamps
  const chunks = (result as { chunks?: { timestamp: [number, number]; text: string }[] }).chunks ?? [];

  if (chunks.length > 0) {
    return chunks.map((c, i) => ({
      start: c.timestamp[0],
      end: c.timestamp[1],
      text: c.text.trim(),
      confidence: 0.9,
    }));
  }

  // No timestamps — return single utterance for the full text
  return [{ start: 0, end: 0, text: result.text ?? "", confidence: 0.8 }];
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (hasFullClerkConfig()) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { audioUrl } = await req.json();
  if (!audioUrl || typeof audioUrl !== "string") {
    return NextResponse.json({ error: "audioUrl required" }, { status: 400 });
  }

  try {
    let utterances: Utterance[];

    if (process.env.DEEPGRAM_API_KEY) {
      utterances = await transcribeWithDeepgram(audioUrl);
    } else if (process.env.HF_API_KEY) {
      utterances = await transcribeWithWhisper(audioUrl);
    } else {
      return NextResponse.json(
        { error: "Aucune clé de transcription configurée (DEEPGRAM_API_KEY ou HF_API_KEY)" },
        { status: 503 }
      );
    }

    const transcript = utterances.map((u) => u.text).join(" ");
    return NextResponse.json({ transcript, utterances });
  } catch (err) {
    console.error("Transcribe error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
