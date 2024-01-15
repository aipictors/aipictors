import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { gql } from "@apollo/client"

export const folderWorksQuery = gql`
  ${partialWorkFieldsFragment}
  query FolderWorks($folderId: ID!, $offset: Int!, $limit: Int!) {
    folder(id: $folderId) {
      id
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`
