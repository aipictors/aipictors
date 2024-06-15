import { graphql } from "gql.tada"

export const partialWorkFieldsFragment = graphql(
  `fragment PartialWorkFields on WorkNode @_unmask {
    id
    title
    accessType
    adminAccessType
    likesCount
    commentsCount
    bookmarksCount
    viewsCount
    createdAt
    isTagEditable
    smallThumbnailImageURL
    smallThumbnailImageHeight
    smallThumbnailImageWidth
    largeThumbnailImageURL
    largeThumbnailImageHeight
    largeThumbnailImageWidth
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
