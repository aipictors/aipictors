import { partialUserFieldsFragment } from "@/graphql/fragments/partial-user-fields"
import { graphql } from "gql.tada"

export const followNotificationFieldsFragment = graphql(
  `fragment FollowNotificationFields on FollowNotificationNode @_unmask {
    id
    createdAt
    user {
      ...PartialUserFields
    }
  }`,
  [partialUserFieldsFragment],
)
