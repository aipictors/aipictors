import { gql } from "@/graphql/__generated__"

export const stickerQuery = gql(`
  query Sticker($id: ID!) {
    sticker(id: $id) {
      id
      createdAt
      title
      user {
        id
        name
        iconImage {
          id
          downloadURL
        }
      }
      image {
        id
        downloadURL
      }
      downloadsCount
      likesCount
      usesCount
    }
  }
`)
