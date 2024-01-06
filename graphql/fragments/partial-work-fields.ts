import { gql } from "@apollo/client"

export default gql`
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