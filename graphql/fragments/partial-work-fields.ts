import { gql } from "@apollo/client"

export const partialWorkFieldsFragment = gql`
  fragment PartialWorkFields on WorkNode {
    id
    title
    likesCount
    commentsCount
    createdAt
    largeThumbnailImageURL
    largeThumbnailImageHeight
    largeThumbnailImageWidth
  }
`
