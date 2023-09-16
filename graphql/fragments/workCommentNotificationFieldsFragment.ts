import { gql } from "@apollo/client"

export const WORK_COMMENT_NOTIFICATION_FIELDS = gql`
  fragment WorkCommentNotificationFields on WorkCommentNotificationNode {
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
