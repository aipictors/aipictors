import { gql } from "@/_graphql/__generated__"

export const bestWorksQuery = gql(`
  query BestWorks {
    bestWorks(where: {}) {
      ...PartialWorkFields
    }
  }
`)
