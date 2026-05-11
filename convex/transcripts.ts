import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const save = mutation({
  args: {
    projectId: v.id("projects"),
    language: v.string(),
    utterances: v.array(
      v.object({
        start: v.number(),
        end: v.number(),
        text: v.string(),
        confidence: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) throw new Error("Not found");

    const existing = await ctx.db
      .query("transcripts")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();
    if (existing) await ctx.db.delete(existing._id);

    return await ctx.db.insert("transcripts", {
      projectId: args.projectId,
      language: args.language,
      utterances: args.utterances,
    });
  },
});

export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) return null;

    return await ctx.db
      .query("transcripts")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();
  },
});
