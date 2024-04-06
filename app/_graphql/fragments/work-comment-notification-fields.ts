import { gql } from "@/_graphql/__generated__"

export const workCommentNotificationFieldsFragment = gql(`
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
`)
