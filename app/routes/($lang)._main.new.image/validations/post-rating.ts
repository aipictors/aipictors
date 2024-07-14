import { union, literal } from "valibot"

export const vPostRating = union([
  literal("G"),
  literal("R15"),
  literal("R18"),
  literal("R18G"),
])
