import { gql } from "@/graphql/__generated__"

export const commentFieldsFragment = gql(`
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
`)
