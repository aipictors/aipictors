import { gql } from "@apollo/client"

export default gql`
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
