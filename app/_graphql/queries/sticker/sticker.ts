import { graphql } from "gql.tada"

export const stickerQuery = graphql(
  `query Sticker($id: ID!) {
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
      imageUrl
      downloadsCount
      likesCount
      usesCount
    }
  }`,
)
