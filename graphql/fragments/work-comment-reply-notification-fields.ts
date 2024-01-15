import { gql } from "@/graphql/__generated__"

export const workCommentReplyNotificationFieldsFragment = gql(`
  fragment WorkCommentReplyNotificationFields on WorkCommentReplyNotificationNode {
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
  }
`)
