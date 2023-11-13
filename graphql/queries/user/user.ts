import { gql } from "@apollo/client"

export default gql`
  query User($userId: ID!) {
    user(id: $userId) {
      ...UserFields
      isFollower
      isFollowee
      isMuted
    }
  }
`
