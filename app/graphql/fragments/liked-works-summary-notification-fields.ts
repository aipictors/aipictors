import { graphql } from "gql.tada"

export const likedWorksSummaryNotificationFieldsFragment = graphql(
  `fragment LikedWorksSummaryNotificationFields on LikedWorksSummaryNotificationNode @_unmask {
    id
    createdAt
    message
  }`,
)
