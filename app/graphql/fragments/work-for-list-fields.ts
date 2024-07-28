import { graphql } from "gql.tada"

export const workForListFieldsFragment = graphql(
  `fragment WorkForListFields on WorkNode @_unmask {
    id
    title
    enTitle
    description
    enDescription
    largeThumbnailImageHeight
    largeThumbnailImageURL
    largeThumbnailImageWidth
    smallThumbnailImageHeight
    smallThumbnailImageURL
    smallThumbnailImageWidth
    thumbnailImagePosition
    isGeneration
    isSensitive
    user {
      id
      iconUrl
      name
    }
    likesCount
    isLiked
  }`,
)
