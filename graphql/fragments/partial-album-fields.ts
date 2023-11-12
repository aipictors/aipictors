import { gql } from "@apollo/client"

export default gql`
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
