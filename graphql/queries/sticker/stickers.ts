import { partialStickerFieldsFragment } from "@/graphql/fragments/partial-sticker-fields"
import { gql } from "@apollo/client"

export const stickersQuery = gql`
  ${partialStickerFieldsFragment}
  query Stickers($offset: Int!, $limit: Int!, $where: StickersWhereInput) {
    stickers(offset: $offset, limit: $limit, where: $where) {
      ...PartialStickerFields
    }
  }
`
