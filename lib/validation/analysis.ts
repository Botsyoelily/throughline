import { z } from "zod";

export const analysisRequestSchema = z.object({
  prompt: z.string().trim().min(10).max(2000)
});

export const analysisResponseSchema = z.object({
  summary: z.string().trim().min(20).max(350),
  recommendation: z.enum(["decline", "accept_with_caution", "safe_to_accept"]),
  rationale: z.string().trim().min(10).max(220),
  confidence: z.number().int().min(0).max(100),
  impacts: z.object({
    immediate: z.string().trim().min(10).max(180),
    shortTerm: z.string().trim().min(10).max(180),
    longTerm: z.string().trim().min(10).max(180)
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

