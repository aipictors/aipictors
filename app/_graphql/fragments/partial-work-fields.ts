import { gql } from "@/_graphql/__generated__"

export const partialWorkFieldsFragment = gql(`
  fragment PartialWorkFields on WorkNode {
    id
    title
    likesCount
    commentsCount
    createdAt
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
