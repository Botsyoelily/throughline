import { z } from "zod";

export const verdictActionSchema = z.object({
  analysisId: z.string().uuid(),
  action: z.enum(["decline", "accept_anyway", "override"])
});
