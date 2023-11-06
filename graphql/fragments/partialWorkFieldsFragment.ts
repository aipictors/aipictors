import { gql } from "@apollo/client"

export const PARTIAL_WORK_FIELDS = gql`
  fragment PartialWorkFields on WorkNode {
    id
    title
    likesCount
    commentsCount
    createdAt
    largeThumbnailImageURL
  }
`
