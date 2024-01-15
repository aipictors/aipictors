import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { gql } from "@apollo/client"

export const bestWorksQuery = gql`
  ${partialWorkFieldsFragment}
  query BestWorks {
    bestWorks(where: {}) {
      ...PartialWorkFields
    }
  }
`
