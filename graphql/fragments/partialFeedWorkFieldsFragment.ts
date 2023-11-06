import { gql } from "@apollo/client"

export const PARTIAL_FEED_WORK_FIELDS = gql`
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
