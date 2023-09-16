import { gql } from "@apollo/client"

export const USER = gql`
  query User($userId: ID!) {
    user(id: $userId) {
      ...UserFields
      viewer {
        id
        isFollower
        isFollowee
        isMuted
      }
    }
  }
`
