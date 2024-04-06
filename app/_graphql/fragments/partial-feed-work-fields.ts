import { gql } from "@/_graphql/__generated__"

export const partialFeedWorkFieldsFragment = gql(`
  fragment PartialFeedWorkFields on WorkNode {
    id
    title
    likesCount
    commentsCount
    createdAt
    imageAspectRatio
    imageURL
  }
`)
