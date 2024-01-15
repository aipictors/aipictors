import { gql } from "@/graphql/__generated__"

export const bestWorksQuery = gql(`
  query BestWorks {
    bestWorks(where: {}) {
      ...PartialWorkFields
    }
  }
`)
