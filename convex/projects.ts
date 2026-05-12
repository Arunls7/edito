import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Génère une URL d'upload signée pour Convex storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
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
    if (!identity) throw new Error("Unauthenticated");

    return await ctx.db.insert("projects", {
      userId: identity.subject,
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
    if (!identity) throw new Error("Unauthenticated");

    return await ctx.db.insert("projects", {
      userId: identity.subject,
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
    if (!identity) return [];

    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(50);
  },
});

// Récupère un projet précis avec son URL vidéo signée
export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project) return null;
    if (project.userId !== identity.subject) return null;

    const videoUrl = project.storageId
      ? await ctx.storage.getUrl(project.storageId)
      : null;

    return {
      ...project,
      videoUrl,
    };
  },
});

// Liste les segments d'un projet (pour la timeline)
export const listSegments = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) return [];

    const segments = await ctx.db
      .query("segments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Format pour la timeline UI : { start, end } sur timeline finale
    return segments
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        start: s.timelineStart,
        end: s.timelineStart + (s.sourceEnd - s.sourceStart),
        trackId: s.trackId,
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Project not found");
    }

    // Stub : chaque tool call sera implémenté progressivement.
    // Pour le MVP on log juste les calls dans la table messages.
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
