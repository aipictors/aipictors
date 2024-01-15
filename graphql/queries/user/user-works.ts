import { gql } from "@/graphql/__generated__"
import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"

export const userWorksQuery = gql(`
  query UserWorks($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      id
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`)
