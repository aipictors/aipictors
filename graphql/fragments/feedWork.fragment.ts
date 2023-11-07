import { gql } from "@apollo/client"

export const FEED_WORK_FIELDS = gql`
  fragment FeedWorkFields on WorkNode {
    id
    title
    description
    imageURL
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
