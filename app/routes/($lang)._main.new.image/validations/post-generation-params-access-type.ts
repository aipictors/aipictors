import { union, literal } from "valibot"

export const vPostGenerationParamAccessType = union([
  literal("PUBLIC"),
  literal("PRIVATE"),
  literal("PUBLIC_IN_OWN_PRODUCT"),
])
