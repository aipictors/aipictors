import { number, object, string } from "valibot"

/**
 * Fileオブジェクト
 */
export const vFile = object({
  name: string(),
  lastModified: number(),
  size: number(),
  type: string(),
  webkitRelativePath: string(),
})
