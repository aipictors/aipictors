import { partialStickerFieldsFragment } from "@/graphql/fragments/partial-sticker-fields"
import { gql } from "@apollo/client"

export const userStickersQuery = gql`
  ${partialStickerFieldsFragment}
  query UserStickers($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      id
      stickers(offset: $offset, limit: $limit) {
        ...PartialStickerFields
      }
    }
  }
`
