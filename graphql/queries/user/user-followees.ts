import { gql } from "@/graphql/__generated__"
import { partialUserFieldsFragment } from "@/graphql/fragments/partial-user-fields"

export const userFolloweesQuery = gql(`
  query UserFollowees($user_id: ID!, $offset: Int!, $limit: Int!) {
    user(id: $user_id) {
      id
      followees(offset: $offset, limit: $limit) {
        ...PartialUserFields
      }
    }
  }
`)
