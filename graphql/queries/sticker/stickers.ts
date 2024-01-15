import { gql } from "@/graphql/__generated__"
import { partialStickerFieldsFragment } from "@/graphql/fragments/partial-sticker-fields"

export const stickersQuery = gql(`
  query Stickers($offset: Int!, $limit: Int!, $where: StickersWhereInput) {
    stickers(offset: $offset, limit: $limit, where: $where) {
      ...PartialStickerFields
    }
  }
`)
