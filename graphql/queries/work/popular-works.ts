import { gql } from "@/graphql/__generated__"
import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"

export const popularWorksQuery = gql(`
  query PopularWorks {
    popularWorks(where: {}) {
      ...PartialWorkFields
    }
  }
`)
