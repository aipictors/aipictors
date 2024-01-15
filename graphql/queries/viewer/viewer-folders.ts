import { gql } from "@/graphql/__generated__"

export const viewerFoldersQuery = gql(`
  query ViewerFolders($offset: Int!, $limit: Int!) {
    viewer {
      folders(offset: $offset, limit: $limit) {
        ...PartialFolderFields
      }
    }
  }
`)
