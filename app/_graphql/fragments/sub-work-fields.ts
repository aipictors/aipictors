import { gql } from "@/_graphql/__generated__"

export const subWorkFieldsFragment = gql(`
  fragment SubWorkFields on SubWorkNode {
    id
    image {
      id
      downloadURL
    }
    thumbnailImage {
      id
      downloadURL
    }
  }
`)
