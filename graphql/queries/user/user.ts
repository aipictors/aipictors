import { gql } from "@apollo/client"

export const USER = gql`
  query User($userId: ID!) {
    user(id: $userId) {
      ...UserFields
      isFollower
      isFollowee
      isMuted
    }
  }
`
