import { gql } from "@apollo/client"

export const LIKED_WORKS_SUMMARY_NOTIFICATION_FIELDS = gql`
  fragment LikedWorksSummaryNotificationFields on LikedWorksSummaryNotificationNode {
    id
    createdAt
    message
  }
`
