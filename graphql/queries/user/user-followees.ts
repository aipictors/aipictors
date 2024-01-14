import { partialUserFieldsFragment } from "@/graphql/fragments/partial-user-fields"
import { gql } from "@apollo/client"

export const userFolloweesQuery = gql`
  ${partialUserFieldsFragment}
  query UserFollowees($user_id: ID!, $offset: Int!, $limit: Int!) {
    user(id: $user_id) {
      id
      followees(offset: $offset, limit: $limit) {
        ...PartialUserFields
      }
    }
  }
`
