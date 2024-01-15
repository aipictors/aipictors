import { gql } from "@/graphql/__generated__"
import { userFieldsFragment } from "@/graphql/fragments/user-fields"

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
