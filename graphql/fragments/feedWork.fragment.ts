import { gql } from "@apollo/client"

export const FEED_WORK_FIELDS = gql`
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
