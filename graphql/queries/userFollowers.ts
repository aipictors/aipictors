import { gql } from "@apollo/client"

export const USER_FOLLOWERS = gql`
  query UserFollowers($user_id: ID!, $offset: Int!, $limit: Int!) {
    user(id: $user_id) {
      id
      followers(offset: $offset, limit: $limit) {
        ...PartialUserFields
      }
    }
  }
`
