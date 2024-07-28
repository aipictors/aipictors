import { partialStickerFieldsFragment } from "@/graphql/fragments/partial-sticker-fields"
import { partialUserFieldsFragment } from "@/graphql/fragments/partial-user-fields"
import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { commentFieldsFragment } from "@/graphql/fragments/comment-fields"
import { graphql } from "gql.tada"

export const workCommentNotificationFieldsFragment = graphql(
  `fragment WorkCommentNotificationFields on WorkCommentNotificationNode @_unmask {
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
    myReplies {
      ...CommentFields
    }
  }`,
  [
    partialWorkFieldsFragment,
    partialUserFieldsFragment,
    partialStickerFieldsFragment,
    commentFieldsFragment,
  ],
)
