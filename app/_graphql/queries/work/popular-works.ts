import { gql } from "@/_graphql/__generated__"

export const popularWorksQuery = gql(`
  query PopularWorks {
    popularWorks(where: {}) {
      ...PartialWorkFields
    }
  }
`)
