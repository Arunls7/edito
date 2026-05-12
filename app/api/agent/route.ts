import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

const TOOLS: Groq.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "trim_clip",
      description: "Réduit un clip à un intervalle donné [start, end] en secondes.",
      parameters: {
        type: "object",
        properties: {
          clipId: { type: "string" },
          start: { type: "number", description: "Début en secondes" },
          end: { type: "number", description: "Fin en secondes" },
        },
        required: ["clipId", "start", "end"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remove_silences",
      description: "Détecte et supprime les silences d'une piste audio.",
      parameters: {
        type: "object",
        properties: {
          trackId: { type: "string" },
          threshold_db: { type: "number", description: "Seuil dB (défaut -40)" },
          padding_ms: { type: "number", description: "Marge avant/après chaque mot (défaut 150)" },
        },
        required: ["trackId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_captions",
      description: "Génère et insère des captions stylées synchronisées avec le transcript.",
      parameters: {
        type: "object",
        properties: {
          trackId: { type: "string" },
          style: { type: "string", enum: ["minimal", "bold", "kinetic"] },
        },
        required: ["trackId", "style"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_clips",
      description: "Découpe une vidéo longue en N clips courts pour les réseaux.",
      parameters: {
        type: "object",
        properties: {
          sourceClipId: { type: "string" },
          count: { type: "number", description: "Nombre de clips à générer" },
          theme: { type: "string", description: "Thème optionnel pour filtrer" },
        },
        required: ["sourceClipId", "count"],
      },
    },
  },
];

const SYSTEM_PROMPT = `Tu es Director, l'assistant de montage vidéo d'Rushly.

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
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = RequestSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...body.history.map((h) => ({ role: h.role, content: h.content }) as Groq.Chat.ChatCompletionMessageParam),
    { role: "user", content: body.message },
  ];

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      tools: TOOLS,
      messages,
    });

    const message = response.choices[0]?.message;
    const text = message?.content ?? "";
    const toolCalls: { name: string; input: unknown }[] = [];

    for (const tc of message?.tool_calls ?? []) {
      const schema = ToolSchemas[tc.function.name as keyof typeof ToolSchemas];
      if (!schema) continue;
      try {
        const parsed = schema.safeParse(JSON.parse(tc.function.arguments));
        if (parsed.success) toolCalls.push({ name: tc.function.name, input: parsed.data });
      } catch {}
    }

    return NextResponse.json({ text, toolCalls });
  } catch (err) {
    console.error("Agent error:", err);
    return NextResponse.json({ error: "Agent failed" }, { status: 500 });
  }
}
