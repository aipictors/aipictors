import { gql } from "@apollo/client"

export default gql`
  fragment PartialFolderFields on FolderNode {
    id
    title
    rating
    description
    thumbnailImageURL
  }
`
