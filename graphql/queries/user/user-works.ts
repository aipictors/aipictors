import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { gql } from "@apollo/client"

export const userWorksQuery = gql`
  ${partialWorkFieldsFragment}
  query UserWorks($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      id
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`
