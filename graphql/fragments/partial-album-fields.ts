import { gql } from "@apollo/client"

export const partialAlbumFieldsFragment = gql`
  fragment PartialAlbumFields on AlbumNode {
    id
    title
    isSensitive
    likesCount
    viewsCount
    thumbnailImage {
      id
      downloadURL
    }
  }
`
