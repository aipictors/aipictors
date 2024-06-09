import { partialStickerFieldsFragment } from "@/_graphql/fragments/partial-sticker-fields"
import { graphql } from "gql.tada"

export const userStickersQuery = graphql(
  `query UserStickers($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      id
      stickers(offset: $offset, limit: $limit) {
        ...PartialStickerFields
      }
    }
  }`,
  [partialStickerFieldsFragment],
)
