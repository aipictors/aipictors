import type { TypePolicies } from "@apollo/client"
import { offsetLimitPagination } from "@apollo/client/utilities"

export const typePolicies: TypePolicies = {
  Query: {
    fields: {},
  },
  Viewer: {
    fields: {
      imageGenerationTasks: offsetLimitPagination(["where"]),
    },
  },
}
