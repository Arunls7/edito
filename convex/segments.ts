import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

const segmentFields = v.object({
  sourceStart: v.number(),
  sourceEnd: v.number(),
  timelineStart: v.number(),
  order: v.number(),
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
