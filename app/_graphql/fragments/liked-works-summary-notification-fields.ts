import { gql } from "@/_graphql/__generated__"

export const likedWorksSummaryNotificationFieldsFragment = gql(`
  fragment LikedWorksSummaryNotificationFields on LikedWorksSummaryNotificationNode {
    id
    createdAt
    message
  }
`)
