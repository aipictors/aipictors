import { gql } from "@apollo/client"

export default gql`
  fragment CommentFields on CommentNode {
    id
    createdAt
    text
    user {
      ...WorkUserFields
    }
    sticker {
      id
      image {
        id
        downloadURL
      }
    }
  }
`
