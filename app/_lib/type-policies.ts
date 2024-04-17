import type { TypePolicies } from "@apollo/client/index.js"

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
