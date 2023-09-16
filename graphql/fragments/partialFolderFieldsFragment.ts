import { gql } from "@apollo/client"

export const PARTIAL_FOLDER_FIELDS = gql`
  fragment PartialFolderFields on FolderNode {
    id
    title
    rating
    description
    thumbnailImageURL
  }
`
