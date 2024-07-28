import type { TypePolicies } from "@apollo/client/index"

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
