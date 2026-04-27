import { z } from "zod";

export const analysisRequestSchema = z.object({
  prompt: z.string().trim().min(10).max(2000)
});

export const followUpRequestSchema = z.object({
  optionId: z.enum(["dig_deeper", "my_rights", "analyze_another"]),
  originalPrompt: z.string().trim().min(10).max(2000),
  summary: z.string().trim().min(10).max(700),
  rationale: z.string().trim().min(10).max(600),
  recommendation: z.enum(["decline", "accept_with_caution", "safe_to_accept"])
});

export const analysisResponseSchema = z.object({
  summary: z.string().trim().min(20).max(700),
  recommendation: z.enum(["decline", "accept_with_caution", "safe_to_accept"]),
  rationale: z.string().trim().min(10).max(600),
  confidence: z.number().int().min(0).max(100),
  impacts: z.object({
    immediate: z.string().trim().min(10).max(500),
    shortTerm: z.string().trim().min(10).max(500),
    longTerm: z.string().trim().min(10).max(500)
  }),
  userOptions: z
    .array(
      z.object({
        id: z.enum(["dig_deeper", "my_rights", "analyze_another"]),
        label: z.string().trim().min(2).max(40)
      })
    )
    .length(3)
});
