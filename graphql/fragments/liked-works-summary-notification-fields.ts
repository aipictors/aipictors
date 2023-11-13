import { gql } from "@apollo/client"

export default gql`
  fragment LikedWorksSummaryNotificationFields on LikedWorksSummaryNotificationNode {
    id
    createdAt
    message
  }
`
