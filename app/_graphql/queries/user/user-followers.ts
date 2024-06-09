import { partialUserFieldsFragment } from "@/_graphql/fragments/partial-user-fields"
import { graphql } from "gql.tada"

export const userFollowersQuery = graphql(
  `query UserFollowers($user_id: ID!, $offset: Int!, $limit: Int!) {
    user(id: $user_id) {
      id
      followers(offset: $offset, limit: $limit) {
        ...PartialUserFields
      }
    }
  }`,
  [partialUserFieldsFragment],
)
