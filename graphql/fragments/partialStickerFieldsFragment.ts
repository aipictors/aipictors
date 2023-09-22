import { gql } from "@apollo/client"

export const PARTIAL_STICKER_FIELDS = gql`
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
`
