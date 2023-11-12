import { gql } from "@apollo/client"

export default gql`
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
