import { gql } from "@apollo/client"

export const partialFeedWorkFieldsFragment = gql`
  fragment PartialFeedWorkFields on WorkNode {
    id
    title
    likesCount
    commentsCount
    createdAt
    imageAspectRatio
    imageURL
  }
`
