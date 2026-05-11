import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";
import { auth } from "@clerk/nextjs/server";

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { audioUrl } = await req.json();
  if (!audioUrl || typeof audioUrl !== "string") {
    return NextResponse.json({ error: "audioUrl required" }, { status: 400 });
  }

  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
      { url: audioUrl },
      {
        model: "nova-3",
        smart_format: true,
        punctuate: true,
        diarize: false,
        utterances: true,
        detect_language: true,
      }
    );

    if (error) {
      console.error("Deepgram error:", error);
      return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
    }

    const utterances = result?.results?.utterances ?? [];
    const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";

    return NextResponse.json({
      transcript,
      utterances: utterances.map((u) => ({
        start: u.start,
        end: u.end,
        text: u.transcript,
        confidence: u.confidence,
      })),
    });
  } catch (err) {
    console.error("Transcribe error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
