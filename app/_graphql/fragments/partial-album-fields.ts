import { gql } from "@/_graphql/__generated__"

export const partialAlbumFieldsFragment = gql(`
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
`)
