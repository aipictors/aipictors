import { partialUserFieldsFragment } from "~/graphql/fragments/partial-user-fields"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { graphql } from "gql.tada"

export const likedWorkNotificationFieldsFragment = graphql(
  `fragment LikedWorkNotificationFields on LikedWorkNotificationNode @_unmask {
    id
    createdAt
    isAnonymous
    work {
      ...PartialWorkFields
    }
    user {
      ...PartialUserFields
    }
  }`,
  [partialWorkFieldsFragment, partialUserFieldsFragment],
)
