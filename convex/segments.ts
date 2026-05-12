import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";

const segmentFields = v.object({
  sourceStart: v.number(),
  sourceEnd: v.number(),
  timelineStart: v.number(),
  order: v.number(),
  text: v.optional(v.string()),
});

// Replace all segments on a given track for a project
export const replaceTrack = internalMutation({
  args: {
    projectId: v.id("projects"),
    trackId: v.string(),
    segments: v.array(segmentFields),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("segments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const seg of existing) {
      if (seg.trackId === args.trackId) await ctx.db.delete(seg._id);
    }

    for (const seg of args.segments) {
      await ctx.db.insert("segments", {
        projectId: args.projectId,
        trackId: args.trackId,
        ...seg,
      });
    }

    return args.segments.length;
  },
});

// Trim a single segment's in/out points (non-ripple)
export const trimClip = mutation({
  args: {
    segmentId: v.id("segments"),
    sourceStart: v.number(),
    sourceEnd: v.number(),
    timelineStart: v.number(),
  },
  handler: async (ctx, args) => {
    const seg = await ctx.db.get(args.segmentId);
    if (!seg) throw new Error("Segment not found");
    if (args.sourceEnd - args.sourceStart < 0.05) throw new Error("Clip too short");
    await ctx.db.patch(args.segmentId, {
      sourceStart: args.sourceStart,
      sourceEnd: args.sourceEnd,
      timelineStart: args.timelineStart,
    });
  },
});
