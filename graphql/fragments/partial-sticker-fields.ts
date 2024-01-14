import { gql } from "@apollo/client"

export const partialStickerFieldsFragment = gql`
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
