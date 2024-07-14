import { nullable, number, object, string } from "valibot"

/**
 * Fileオブジェクト
 */
export const vFile = object({
  name: nullable(string()),
  lastModified: number(),
  size: number(),
  type: nullable(string()),
  webkitRelativePath: nullable(string()),
})
