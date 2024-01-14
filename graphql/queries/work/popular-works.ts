import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { gql } from "@apollo/client"

export const popularWorksQuery = gql`
  ${partialWorkFieldsFragment}
  query PopularWorks {
    popularWorks(where: {}) {
      ...PartialWorkFields
    }
  }
`
