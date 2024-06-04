import { gql } from "@/_graphql/__generated__"

export const partialWorkFieldsFragment = gql(`
  fragment PartialWorkFields on WorkNode {
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
    user {
      id
      name
      iconUrl
      iconImage {
        downloadURL
        id
        type
      }
    }
  }
`)
