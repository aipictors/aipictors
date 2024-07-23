import { union, literal } from "valibot"

export const vPostType = union([
  literal("COLUMN"),
  literal("NOVEL"),
  literal("VIDEO"),
  literal("WORK"),
])
