import { gql } from "@/graphql/__generated__"
import { partialStickerFieldsFragment } from "@/graphql/fragments/partial-sticker-fields"

export const userStickersQuery = gql(`
  query UserStickers($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      id
      stickers(offset: $offset, limit: $limit) {
        ...PartialStickerFields
      }
    }
  }
`)
