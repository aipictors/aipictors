import { gql } from "@apollo/client"

export const VIEWER_FOLDERS = gql`
  query ViewerFolders($offset: Int!, $limit: Int!) {
    viewer {
      folders(offset: $offset, limit: $limit) {
        ...PartialFolderFields
      }
    }
  }
`
