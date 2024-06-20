import { graphql } from "gql.tada"

export const partialAlbumFieldsFragment = graphql(
  `fragment PartialAlbumFields on AlbumNode @_unmask {
    id
    title
    isSensitive
    likesCount
    viewsCount
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
  }`,
)
