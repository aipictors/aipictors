import type { TypePolicies } from "@apollo/client"

export const typePolicies: TypePolicies = {
  Query: {
    fields: {},
  },
  Viewer: {
    fields: {
      // imageGenerationTasks: offsetLimitPagination(["where"]),
    },
  },
}
