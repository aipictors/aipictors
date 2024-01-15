import { gql } from "@apollo/client"

export const followUserMutation = gql`
  mutation FollowUser($input: FollowUserInput!) {
    followUser(input: $input) {
      id
      isFollowee
    }
  }
`
