import { union, literal } from "valibot"

export const vPostAccessType = union([
  literal("PUBLIC"),
  literal("SILENT"),
  literal("LIMITED"),
  literal("PRIVATE"),
  literal("DRAFT"),
])
