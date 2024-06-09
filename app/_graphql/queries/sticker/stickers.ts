import { partialStickerFieldsFragment } from "@/_graphql/fragments/partial-sticker-fields"
import { graphql } from "gql.tada"

export const stickersQuery = graphql(
  `query Stickers($offset: Int!, $limit: Int!, $where: StickersWhereInput) {
    stickers(offset: $offset, limit: $limit, where: $where) {
      ...PartialStickerFields
    }
  }`,
  [partialStickerFieldsFragment],
)
