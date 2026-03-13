import { z } from "zod";

export const accessTokenSchema = z.object({
  accessToken: z.string().trim().min(12).max(256)
});

