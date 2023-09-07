import { gql } from "@apollo/client"

export const FeedWorkFields = gql`
  fragment FeedWorkFields on WorkNode {
    id
    title
    description
    image {
      id
      downloadURL
    }
    user {
      id
      name
      login
      iconImage {
        id
        downloadURL
      }
    }
    createdAt
    likesCount
    viewsCount
  }
`
