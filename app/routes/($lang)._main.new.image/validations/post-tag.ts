import { object, string } from "valibot"

export const vTag = object({
  id: string(),
  text: string(),
})
