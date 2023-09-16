import { gql } from "@apollo/client"

export const PARTIAL_ALBUM_FIELDS = gql`
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
