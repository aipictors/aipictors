import { gql } from "@apollo/client"

export const USER_STICKERS = gql`
  query UserStickers($user_id: ID!, $offset: Int!, $limit: Int!) {
    user(id: $user_id) {
      id
      stickers(offset: $offset, limit: $limit) {
        ...PartialStickerFields
      }
    }
  }
`
