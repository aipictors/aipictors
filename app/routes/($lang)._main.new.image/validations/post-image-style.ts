import { union, literal } from "valibot"

export const vPostImageStyle = union([
  literal("ILLUSTRATION"),
  literal("REAL"),
  literal("SEMI_REAL"),
])
