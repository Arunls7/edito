import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, type FunctionDeclaration } from "@google/generative-ai";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { hasFullClerkConfig } from "@/lib/clerk-config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

// ─── Tool input validators ─────────────────────────────────────────────────────

const ToolSchemas = {
  remove_silences: z.object({
    padding_ms: z.number().optional().default(150),
    min_silence_len_ms: z.number().optional().default(500),
    silence_thresh_db: z.number().optional().default(-40),
  }),
  add_captions: z.object({
    style: z.enum(["minimal", "bold", "kinetic"]).default("minimal"),
  }),
  generate_music: z.object({
    description: z.string(),
    duration_seconds: z.number().optional().default(20),
  }),
} as const;

// ─── Gemini function declarations ─────────────────────────────────────────────

const FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: "remove_silences",
    description: "Détecte et supprime automatiquement les silences de la vidéo principale. Utilise la transcription existante pour identifier les passages sans parole.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        padding_ms: { type: SchemaType.NUMBER, description: "Marge en ms conservée avant/après chaque segment de parole (défaut 150)" },
        min_silence_len_ms: { type: SchemaType.NUMBER, description: "Durée minimale d'un silence pour le supprimer en ms (défaut 500)" },
        silence_thresh_db: { type: SchemaType.NUMBER, description: "Seuil de détection du silence en dBFS (défaut -40)" },
      },
      required: [],
    },
  },
  {
    name: "add_captions",
    description: "Génère et insère des captions animées à partir du transcript. Les captions s'affichent en temps réel sur la vidéo.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        style: {
          type: SchemaType.STRING,
          format: "enum",
          enum: ["minimal", "bold", "kinetic"],
          description: "Style visuel des captions : minimal (discret, fond sombre), bold (jaune, impact), kinetic (slide-up violet)",
        },
      },
      required: ["style"],
    },
  },
  {
    name: "generate_music",
    description: "Génère une musique de fond originale via IA (MusicGen) à partir d'une description textuelle.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        description: { type: SchemaType.STRING, description: "Description du style musical (ex: 'upbeat lo-fi hip hop', 'cinematic orchestral')" },
        duration_seconds: { type: SchemaType.NUMBER, description: "Durée souhaitée en secondes (défaut 20, max 30)" },
      },
      required: ["description"],
    },
  },
];

// ─── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Tu es Director, l'assistant de montage vidéo de Rushly.

Tu reçois des demandes en langage naturel et tu les traduis en appels d'outils qui modifient la timeline vidéo.

Outils disponibles :
- remove_silences : supprime les silences de la vidéo
- add_captions : ajoute des captions animées (minimal / bold / kinetic)
- generate_music : génère une musique de fond IA

Principes :
- Sois concis dans tes réponses. Pas de bla-bla ni de "bien sûr".
- Si la demande est claire, appelle directement l'outil sans paraphraser.
- Si la demande est ambiguë, pose UNE question courte.
- Réponds en français si l'utilisateur parle français, sinon en anglais.`;

// ─── Request schema ────────────────────────────────────────────────────────────

const RequestSchema = z.object({
  projectId: z.string(),
  message: z.string().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(20)
    .default([]),
});

// ─── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (hasFullClerkConfig()) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof RequestSchema>;
  try {
    body = RequestSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY non configuré." }, { status: 500 });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
    });

    // Convert history: "assistant" → "model" for Gemini
    // Gemini requires history to start with a 'user' turn — strip all leading model messages
    const allHistory = body.history.map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }],
    }));
    const firstUserIdx = allHistory.findIndex((m) => m.role === "user");
    const history = firstUserIdx === -1 ? [] : allHistory.slice(firstUserIdx);

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(body.message);
    const response = result.response;

    // Extract text (may be empty when the model only calls functions)
    let text = "";
    try { text = response.text(); } catch { /* model returned only function calls */ }

    // Extract and validate function calls
    const toolCalls: { name: string; input: unknown }[] = [];
    for (const fc of response.functionCalls() ?? []) {
      const schema = ToolSchemas[fc.name as keyof typeof ToolSchemas];
      if (!schema) continue;
      const parsed = schema.safeParse(fc.args ?? {});
      if (parsed.success) toolCalls.push({ name: fc.name, input: parsed.data });
    }

    return NextResponse.json({ text, toolCalls });
  } catch (err) {
    console.error("Agent error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
