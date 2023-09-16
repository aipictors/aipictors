import { gql } from "@apollo/client"

export const USER_FOLLOWEES = gql`
  query UserFollowees($user_id: ID!, $offset: Int!, $limit: Int!) {
    user(id: $user_id) {
      id
      followees(offset: $offset, limit: $limit) {
        ...PartialUserFields
      }
    }
  }
`
