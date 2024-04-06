import { gql } from "@/_graphql/__generated__"

export const userQuery = gql(`
  query User($userId: ID!) {
    user(id: $userId) {
      ...UserFields
      isFollower
      isFollowee
      isMuted
    }
  }
`)
