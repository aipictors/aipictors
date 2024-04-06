import { gql } from "@/_graphql/__generated__"

export const feedWorkFieldsFragment = gql(`
  fragment FeedWorkFields on WorkNode {
    id
    title
    description
    imageURL
    user {
      id
      name
      login
      iconImage {
        id
        downloadURL
      }
    }
    createdAt
    likesCount
    viewsCount
  }
`)
