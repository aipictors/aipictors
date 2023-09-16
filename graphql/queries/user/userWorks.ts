import { gql } from "@apollo/client"

export const USER_WORKS = gql`
  query UserWorks($user_id: ID!, $offset: Int!, $limit: Int!) {
    user(id: $user_id) {
      id
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`
