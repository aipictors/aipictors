import { gql } from "@apollo/client"

export const LIKED_WORK_NOTIFICATION_FIELDS = gql`
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
