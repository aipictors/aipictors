import { gql } from "@apollo/client"

export const WORK_AWARD_NOTIFICATION_FIELDS = gql`
  fragment WorkAwardNotificationFields on WorkAwardNotificationNode {
    id
    createdAt
    message
    work {
      ...PartialWorkFields
    }
  }
`
