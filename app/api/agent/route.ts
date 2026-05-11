import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// --- Schémas des tool calls ---
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
} as const;

const TOOLS: Anthropic.Messages.Tool[] = [
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
    description:
      "Détecte et supprime les silences d'une piste audio. Utilise Silero VAD côté serveur.",
    input_schema: {
      type: "object" as const,
      properties: {
        trackId: { type: "string" },
        threshold_db: {
          type: "number",
          description: "Seuil dB en-dessous duquel c'est un silence (défaut -40)",
        },
        padding_ms: {
          type: "number",
          description: "Marge avant/après chaque mot pour éviter coupes brutales (défaut 150)",
        },
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
    description:
      "Découpe une vidéo longue en N clips courts pour les réseaux. Utilise le transcript pour trouver les moments forts.",
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
];

const SYSTEM_PROMPT = `Tu es Director, l'assistant de montage vidéo d'Edito.

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
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(20)
    .default([]),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = RequestSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const messages: Anthropic.Messages.MessageParam[] = [
    ...body.history.map((h) => ({
      role: h.role,
      content: h.content,
    })),
    { role: "user" as const, content: body.message },
  ];

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });

    let text = "";
    const toolCalls: { name: string; input: unknown }[] = [];

    for (const block of response.content) {
      if (block.type === "text") text += block.text;
      if (block.type === "tool_use") {
        // Validation Zod par tool
        const schema = ToolSchemas[block.name as keyof typeof ToolSchemas];
        if (!schema) continue;
        const parsed = schema.safeParse(block.input);
        if (parsed.success) {
          toolCalls.push({ name: block.name, input: parsed.data });
        }
      }
    }

    return NextResponse.json({ text, toolCalls });
  } catch (err) {
    console.error("Agent error:", err);
    return NextResponse.json({ error: "Agent failed" }, { status: 500 });
  }
}
