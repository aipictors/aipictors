import { gql } from "@apollo/client"

export const subWorkFieldsFragment = gql`
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
`
