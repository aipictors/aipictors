import { gql } from "@apollo/client"

export default gql`
  query UserFollowers($user_id: ID!, $offset: Int!, $limit: Int!) {
    user(id: $user_id) {
      id
      followers(offset: $offset, limit: $limit) {
        ...PartialUserFields
      }
    }
  }
`
