import { gql } from "@/_graphql/__generated__"

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
