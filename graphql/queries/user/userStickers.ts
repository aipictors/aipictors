import { gql } from "@apollo/client"

export const USER_STICKERS = gql`
  query UserStickers($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      id
      stickers(offset: $offset, limit: $limit) {
        ...PartialStickerFields
      }
    }
  }
`
