import { gql } from "@apollo/client"

export const SUB_WORK_FIELDS = gql`
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
