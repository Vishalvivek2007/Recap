import { z } from "zod";

/**
 * Strict schema that the LLM's JSON output must conform to.
 * If the AI returns malformed JSON, we retry once with a stricter prompt.
 */

export const ActionItemSchema = z.object({
  assignee: z.string(),
  task: z.string(),
  deadline: z.string().nullable(),
});

export const DecisionSchema = z.object({
  decision: z.string(),
  context: z.string(),
});

export const KeyPointGroupSchema = z.object({
  topic: z.string(),
  points: z.array(z.string()),
});

export const SummarySchema = z.object({
  title: z.string().min(1).max(120),
  tldr: z.string().min(1),
  topics: z.array(z.string()),
  keyPoints: z.array(KeyPointGroupSchema),
  decisions: z.array(DecisionSchema),
  actionItems: z.array(ActionItemSchema),
  questions: z.array(z.string()),
});

export type SummaryType = z.infer<typeof SummarySchema>;