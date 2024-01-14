import { gql } from "@apollo/client"

export const likedWorkNotificationFieldsFragment = gql`
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
`
