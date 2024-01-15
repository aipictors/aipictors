import { gql } from "@/graphql/__generated__"

export const popularWorksQuery = gql(`
  query PopularWorks {
    popularWorks(where: {}) {
      ...PartialWorkFields
    }
  }
`)
