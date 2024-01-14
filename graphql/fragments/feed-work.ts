import { gql } from "@apollo/client"

export const feedWorkFieldsFragment = gql`
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
