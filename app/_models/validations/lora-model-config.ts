import { z } from "zod"

export const zLoraModelConfig = z.object({
  modelId: z.string(),
  value: z.number(),
})
