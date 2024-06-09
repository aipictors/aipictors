import { partialUserFieldsFragment } from "@/_graphql/fragments/partial-user-fields"
import { graphql } from "gql.tada"

export const userFolloweesQuery = graphql(
  `query UserFollowees($user_id: ID!, $offset: Int!, $limit: Int!) {
    user(id: $user_id) {
      id
      followees(offset: $offset, limit: $limit) {
        ...PartialUserFields
      }
    }
  }`,
  [partialUserFieldsFragment],
)
