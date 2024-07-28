import { graphql } from "gql.tada"

export const partialFeedWorkFieldsFragment = graphql(
  `fragment PartialFeedWorkFields on WorkNode @_unmask {
    id
    title
    likesCount
    commentsCount
    createdAt
    imageAspectRatio
    imageURL
  }`,
)
