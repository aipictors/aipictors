import { gql } from "@/graphql/__generated__"

export const partialStickerFieldsFragment = gql(`
  fragment PartialStickerFields on StickerNode {
    id
    title
    image {
      id
      downloadURL
    }
    downloadsCount
    usesCount
    likesCount
  }
`)
