// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // -------------------------
  // USERS TABLE
  // -------------------------
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }).index("by_email", ["email"]),

  // -------------------------
  // JOB INFO TABLE
  // -------------------------
  job_info: defineTable({
    title: v.string(),
    name: v.optional(v.string()), // maybe job poster's name?
    experienceLevel: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),        // reference to users table
  }).index("by_user", ["userId"]),

  // -------------------------
  // QUESTIONS TABLE
  // -------------------------
  questions: defineTable({
    jobInfoId: v.id("job_info"), // foreign key to job_info
    text: v.string(),
    difficulty: v.string(),      // e.g., "easy", "medium", "hard"
  }).index("by_job_info", ["jobInfoId"]),

  // -------------------------
  // INTERVIEWS TABLE
  // -------------------------
  interviews: defineTable({
    jobInfoId: v.id("job_info"),
    duration: v.optional(v.string()),
    humeChatId: v.string(),
    feedback: v.string(),
  })
    .index("by_job_info", ["jobInfoId"])
    .index("by_hume_chat", ["humeChatId"]),
});
