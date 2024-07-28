import { partialStickerFieldsFragment } from "~/graphql/fragments/partial-sticker-fields"
import { partialUserFieldsFragment } from "~/graphql/fragments/partial-user-fields"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { graphql } from "gql.tada"

export const workCommentReplyNotificationFieldsFragment = graphql(
  `fragment WorkCommentReplyNotificationFields on WorkCommentReplyNotificationNode @_unmask {
    id
    createdAt
    message
    work {
      ...PartialWorkFields
    }
    user {
      ...PartialUserFields
    }
    sticker {
      ...PartialStickerFields
    }
  }`,
  [
    partialWorkFieldsFragment,
    partialUserFieldsFragment,
    partialStickerFieldsFragment,
  ],
)
