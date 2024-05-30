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
    thumbnailImageURL
    description
    works(limit: $limit, offset: $offset) {
      id
      title
      imageURL
      largeThumbnailImageURL
      smallThumbnailImageURL
      accessType
      rating
      createdAt
    }
    rating
    createdAt
    slug
    userId
  }
`)
