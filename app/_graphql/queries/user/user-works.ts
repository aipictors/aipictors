import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { graphql } from "gql.tada"

export const userWorksQuery = graphql(
  `query UserWorks($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      id
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }`,
  [partialWorkFieldsFragment],
)
