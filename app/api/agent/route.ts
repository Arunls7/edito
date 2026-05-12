import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { hasFullClerkConfig } from "@/lib/clerk-config";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ToolSchemas = {
  trim_clip: z.object({
    clipId: z.string(),
    start: z.number().min(0),
    end: z.number().min(0),
  }),
  remove_silences: z.object({
    trackId: z.string(),
    threshold_db: z.number().optional().default(-40),
    padding_ms: z.number().optional().default(150),
  }),
  add_captions: z.object({
    trackId: z.string(),
    style: z.enum(["minimal", "bold", "kinetic"]).default("minimal"),
  }),
  generate_clips: z.object({
    sourceClipId: z.string(),
    count: z.number().int().min(1).max(10),
    theme: z.string().optional(),
  }),
  generate_music: z.object({
    description: z.string(),
    duration_seconds: z.number().optional().default(20),
  }),
} as const;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "trim_clip",
    description: "Réduit un clip à un intervalle donné [start, end] en secondes.",
    input_schema: {
      type: "object" as const,
      properties: {
        clipId: { type: "string" },
        start: { type: "number", description: "Début en secondes" },
        end: { type: "number", description: "Fin en secondes" },
      },
      required: ["clipId", "start", "end"],
    },
  },
  {
    name: "remove_silences",
    description: "Détecte et supprime les silences d'une piste audio.",
    input_schema: {
      type: "object" as const,
      properties: {
        trackId: { type: "string" },
        threshold_db: { type: "number", description: "Seuil dB (défaut -40)" },
        padding_ms: { type: "number", description: "Marge avant/après chaque mot (défaut 150)" },
      },
      required: ["trackId"],
    },
  },
  {
    name: "add_captions",
    description: "Génère et insère des captions stylées synchronisées avec le transcript.",
    input_schema: {
      type: "object" as const,
      properties: {
        trackId: { type: "string" },
        style: { type: "string", enum: ["minimal", "bold", "kinetic"] },
      },
      required: ["trackId", "style"],
    },
  },
  {
    name: "generate_clips",
    description: "Découpe une vidéo longue en N clips courts pour les réseaux.",
    input_schema: {
      type: "object" as const,
      properties: {
        sourceClipId: { type: "string" },
        count: { type: "number", description: "Nombre de clips à générer" },
        theme: { type: "string", description: "Thème optionnel pour filtrer" },
      },
      required: ["sourceClipId", "count"],
    },
  },
  {
    name: "generate_music",
    description: "Génère une musique de fond via IA (MusicGen) à partir d'une description.",
    input_schema: {
      type: "object" as const,
      properties: {
        description: { type: "string", description: "Description du style musical souhaité" },
        duration_seconds: { type: "number", description: "Durée en secondes (défaut 20)" },
      },
      required: ["description"],
    },
  },
];

const SYSTEM_PROMPT = `Tu es Director, l'assistant de montage vidéo de Rushly.

Tu reçois des demandes en langage naturel et tu les traduis en séquences de tool calls qui modifient la timeline.

Principes :
- Sois concis dans tes réponses texte. Pas de bla-bla, pas de "bien sûr je peux faire ça".
- Si la demande est claire, exécute directement les tool calls sans paraphraser la demande.
- Si la demande est ambigüe, pose UNE question courte avant d'agir.
- Préfère plusieurs petites opérations atomiques à une grosse.
- Réponds en français si l'utilisateur parle français, sinon en anglais.`;

const RequestSchema = z.object({
  projectId: z.string(),
  message: z.string().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(20)
    .default([]),
});

export async function POST(req: NextRequest) {
  if (hasFullClerkConfig()) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = RequestSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const messages: Anthropic.MessageParam[] = [
    ...body.history.map((h) => ({ role: h.role, content: h.content }) as Anthropic.MessageParam),
    { role: "user", content: body.message },
  ];

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });

    let text = "";
    const toolCalls: { name: string; input: unknown }[] = [];

    for (const block of response.content) {
      if (block.type === "text") text = block.text;
      if (block.type === "tool_use") {
        const schema = ToolSchemas[block.name as keyof typeof ToolSchemas];
        if (!schema) continue;
        const parsed = schema.safeParse(block.input);
        if (parsed.success) toolCalls.push({ name: block.name, input: parsed.data });
      }
    }

    return NextResponse.json({ text, toolCalls });
  } catch (err) {
    console.error("Agent error:", err);
    return NextResponse.json({ error: "Agent failed" }, { status: 500 });
  }
}
