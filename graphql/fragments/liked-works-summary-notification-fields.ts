import { gql } from "@apollo/client"

export const likedWorksSummaryNotificationFieldsFragment = gql`
  fragment LikedWorksSummaryNotificationFields on LikedWorksSummaryNotificationNode {
    id
    createdAt
    message
  }
`
