import { gql } from "@apollo/client"

export const USER_LIKED_WORKS = gql`
  query UserLikedWorks($user_id: ID!, $offset: Int!, $limit: Int!) {
    user(id: $user_id) {
      id
      likedWorks(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`
