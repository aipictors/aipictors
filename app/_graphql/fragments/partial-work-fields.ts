import { gql } from "@/_graphql/__generated__"

export const partialWorkFieldsFragment = gql(`
  fragment PartialWorkFields on WorkNode {
    id
    title
    accessType
    adminAccessType
    likesCount
    commentsCount
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
    user {
      id
      name
      iconUrl
    }
  }
`)
