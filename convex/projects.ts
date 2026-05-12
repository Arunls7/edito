import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function getUserId(identity: { subject: string } | null): string {
  return identity?.subject ?? "anonymous";
}

// Génère une URL d'upload signée pour Convex storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Crée un nouveau projet après upload
export const create = mutation({
  args: {
    title: v.string(),
    storageId: v.id("_storage"),
    sizeBytes: v.number(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = getUserId(identity);

    return await ctx.db.insert("projects", {
      userId,
      title: args.title,
      storageId: args.storageId,
      sizeBytes: args.sizeBytes,
      mimeType: args.mimeType,
      status: "uploaded",
    });
  },
});

// Crée un projet vide depuis le chat (sans vidéo)
export const createEmpty = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = getUserId(identity);

    return await ctx.db.insert("projects", {
      userId,
      title: args.title,
      status: "uploaded",
    });
  },
});

// Liste les projets de l'utilisateur
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = getUserId(identity);

    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

// Récupère un projet précis avec son URL vidéo signée
export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    const videoUrl = project.storageId
      ? await ctx.storage.getUrl(project.storageId)
      : null;

    return { ...project, videoUrl };
  },
});

// Liste les segments d'un projet (pour la timeline)
export const listSegments = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const segments = await ctx.db
      .query("segments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return segments
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        id: s._id,
        start: s.timelineStart,
        end: s.timelineStart + (s.sourceEnd - s.sourceStart),
        trackId: s.trackId,
        text: s.text,
        sourceStart: s.sourceStart,
        sourceEnd: s.sourceEnd,
      }));
  },
});

// Applique une suite de tool calls (appelé après réponse de l'agent)
export const applyToolCalls = mutation({
  args: {
    projectId: v.id("projects"),
    toolCalls: v.array(
      v.object({
        name: v.string(),
        input: v.any(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    for (const tc of args.toolCalls) {
      await ctx.db.insert("messages", {
        projectId: args.projectId,
        role: "tool",
        content: "",
        toolName: tc.name,
        toolInput: tc.input,
      });
    }
  },
});
