import { gql } from "@/graphql/__generated__"

export const stickersQuery = gql(`
  query Stickers($offset: Int!, $limit: Int!, $where: StickersWhereInput) {
    stickers(offset: $offset, limit: $limit, where: $where) {
      ...PartialStickerFields
    }
  }
`)
