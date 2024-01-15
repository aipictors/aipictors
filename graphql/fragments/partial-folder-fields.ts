import { gql } from "@apollo/client"

export const partialFolderFieldsFragment = gql`
  fragment PartialFolderFields on FolderNode {
    id
    title
    rating
    description
    thumbnailImageURL
  }
`
