import { gql } from "@/_graphql/__generated__"

export const folderWorksQuery = gql(`
  query FolderWorks($folderId: ID!, $offset: Int!, $limit: Int!) {
    folder(id: $folderId) {
      id
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`)
