import { gql } from "@/_graphql/__generated__"

export const unFollowUserMutation = gql(`
  mutation UnfollowUser($input: UnfollowUserInput!) {
    unfollowUser(input: $input) {
      id
      isFollowee
    }
  }
`)
