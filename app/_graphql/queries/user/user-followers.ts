import { gql } from "@/_graphql/__generated__"

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
