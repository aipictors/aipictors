import { gql } from "@/_graphql/__generated__"

export const likedWorkNotificationFieldsFragment = gql(`
  fragment LikedWorkNotificationFields on LikedWorkNotificationNode {
    id
    createdAt
    isAnonymous
    work {
      ...PartialWorkFields
    }
    user {
      ...PartialUserFields
    }
  }
`)
