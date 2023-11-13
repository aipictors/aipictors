import { gql } from "@apollo/client"

export default gql`
  mutation FollowUser($input: FollowUserInput!) {
    followUser(input: $input) {
      id
      isFollowee
    }
  }
`
