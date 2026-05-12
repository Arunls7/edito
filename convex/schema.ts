import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    userId: v.string(), // Clerk user ID
    title: v.string(),
    storageId: v.optional(v.id("_storage")),
    sizeBytes: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    status: v.union(
      v.literal("uploaded"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("error")
    ),
  }).index("by_user", ["userId"]),

  // Segments = la timeline. Chaque segment référence une portion du clip source.
  segments: defineTable({
    projectId: v.id("projects"),
    trackId: v.string(), // "main", "broll", "captions", "music"
    sourceStart: v.number(), // début dans le clip source (secondes)
    sourceEnd: v.number(),
    timelineStart: v.number(), // position sur la timeline finale
    order: v.number(),
    text: v.optional(v.string()), // caption text (trackId === "captions" only)
  }).index("by_project", ["projectId"]),

  // Transcript par projet : utterances avec timestamps
  transcripts: defineTable({
    projectId: v.id("projects"),
    language: v.string(), // "fr-FR", "en-US", etc.
    utterances: v.array(
      v.object({
        start: v.number(),
        end: v.number(),
        text: v.string(),
        confidence: v.number(),
      })
    ),
  }).index("by_project", ["projectId"]),

  // Historique chat par projet
  messages: defineTable({
    projectId: v.id("projects"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("tool")),
    content: v.string(),
    toolName: v.optional(v.string()),
    toolInput: v.optional(v.any()),
  }).index("by_project", ["projectId"]),
});
