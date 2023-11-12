import { gql } from "@apollo/client"

export default gql`
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
