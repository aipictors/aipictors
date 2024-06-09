import { graphql } from "gql.tada"

export const unFollowUserMutation = graphql(
  `mutation UnfollowUser($input: UnfollowUserInput!) {
    unfollowUser(input: $input) {
      id
      isFollowee
    }
  }`,
)
