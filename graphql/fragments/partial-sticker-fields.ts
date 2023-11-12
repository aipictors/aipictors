import { gql } from "@apollo/client"

export default gql`
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
