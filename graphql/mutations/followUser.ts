import { gql } from "@apollo/client"

export const FOLLOW_USER = gql`
  mutation FollowUser($input: FollowUserInput!) {
    followUser(input: $input) {
      id
      viewer {
        id
        isFollowee
      }
    }
  }
`
