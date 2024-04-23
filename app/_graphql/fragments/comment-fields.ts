import { gql } from "@/_graphql/__generated__"

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
      imageUrl
      title
      isDownloaded
      likesCount
      usesCount
      downloadsCount
      accessType
    }
  }
`)
