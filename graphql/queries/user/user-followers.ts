import { partialUserFieldsFragment } from "@/graphql/fragments/partial-user-fields"
import { gql } from "@apollo/client"

export const userFollowersQuery = gql`
  ${partialUserFieldsFragment}
  query UserFollowers($user_id: ID!, $offset: Int!, $limit: Int!) {
    user(id: $user_id) {
      id
      followers(offset: $offset, limit: $limit) {
        ...PartialUserFields
      }
    }
  }
`
