import { gql } from "@apollo/client"

export const FOLDER_WORKS = gql`
  query FolderWorks($folderId: ID!, $offset: Int!, $limit: Int!) {
    folder(id: $folderId) {
      id
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`
