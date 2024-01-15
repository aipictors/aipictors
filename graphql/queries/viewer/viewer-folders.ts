import { gql } from "@/graphql/__generated__"
import { partialFolderFieldsFragment } from "@/graphql/fragments/partial-folder-fields"

export const viewerFoldersQuery = gql(`
  query ViewerFolders($offset: Int!, $limit: Int!) {
    viewer {
      folders(offset: $offset, limit: $limit) {
        ...PartialFolderFields
      }
    }
  }
`)
