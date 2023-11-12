import { gql } from "@apollo/client"

export default gql`
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
