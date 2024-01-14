import { partialFolderFieldsFragment } from "@/graphql/fragments/partial-folder-fields"
import { gql } from "@apollo/client"

export const viewerFoldersQuery = gql`
  ${partialFolderFieldsFragment}
  query ViewerFolders($offset: Int!, $limit: Int!) {
    viewer {
      folders(offset: $offset, limit: $limit) {
        ...PartialFolderFields
      }
    }
  }
`
