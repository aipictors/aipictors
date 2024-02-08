import { z } from "zod"

export const zLoraModelConfig = z.object({
  name: z.string(),
  value: z.number(),
})
