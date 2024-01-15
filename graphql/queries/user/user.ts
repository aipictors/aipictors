import { userFieldsFragment } from "@/graphql/fragments/user-fields"
import { gql } from "@apollo/client"

export const userQuery = gql`
  ${userFieldsFragment}
  query User($userId: ID!) {
    user(id: $userId) {
      ...UserFields
      isFollower
      isFollowee
      isMuted
    }
  }
`
