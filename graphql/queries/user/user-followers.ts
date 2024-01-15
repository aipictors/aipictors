import { gql } from "@/graphql/__generated__"
import { partialUserFieldsFragment } from "@/graphql/fragments/partial-user-fields"

export const userFollowersQuery = gql(`
  query UserFollowers($user_id: ID!, $offset: Int!, $limit: Int!) {
    user(id: $user_id) {
      id
      followers(offset: $offset, limit: $limit) {
        ...PartialUserFields
      }
    }
  }
`)
