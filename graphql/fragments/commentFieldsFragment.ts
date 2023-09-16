import { gql } from "@apollo/client"

export const COMMENT_FIELDS = gql`
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
