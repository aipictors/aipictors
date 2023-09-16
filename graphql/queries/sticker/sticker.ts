import { gql } from "@apollo/client"

export const STICKER = gql`
  query Sticker($id: ID!) {
    sticker(id: $id) {
      id
      createdAt
      title
      image {
        id
        downloadURL
      }
      downloadsCount
      likesCount
      usesCount
    }
  }
`
