import { gql } from "@/_graphql/__generated__"

export const partialStickerFieldsFragment = gql(`
  fragment PartialStickerFields on StickerNode {
    id
    title
    imageUrl
    downloadsCount
    usesCount
    likesCount
  }
`)
