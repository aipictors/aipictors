import { gql } from "@apollo/client"

export const WORK_COMMENT_REPLY_NOTIFICATION_FIELDS = gql`
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
`
