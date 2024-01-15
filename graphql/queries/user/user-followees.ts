import { gql } from "@/graphql/__generated__"

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
