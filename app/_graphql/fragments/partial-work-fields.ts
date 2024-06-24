import { graphql } from "gql.tada"

export const partialWorkFieldsFragment = graphql(
  `fragment PartialWorkFields on WorkNode @_unmask {
    id
    title
    accessType
    adminAccessType
    type
    likesCount
    commentsCount
    bookmarksCount
    viewsCount
    createdAt
    rating
    isTagEditable
    smallThumbnailImageURL
    smallThumbnailImageHeight
    smallThumbnailImageWidth
    largeThumbnailImageURL
    largeThumbnailImageHeight
    largeThumbnailImageWidth
    type
    prompt
    negativePrompt
    isLiked
    thumbnailImagePosition
    description
    url
    tags {
      name
    }
    user {
      id
      name
      iconUrl
    }
    uuid
  }`,
)
