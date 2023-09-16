import { gql } from "@apollo/client"

export const FOLLOW_NOTIFICATION_FIELDS = gql`
  fragment FollowNotificationFields on FollowNotificationNode {
    id
    createdAt
    user {
      ...PartialUserFields
    }
  }
`
