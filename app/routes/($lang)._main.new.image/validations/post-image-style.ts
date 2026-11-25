import { literal, union } from "valibot"

export const vPostImageStyle = union([
  literal("ILLUSTRATION"),
  literal("REAL"),
  literal("SEMI_REAL"),
])
