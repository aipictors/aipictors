import { partialFolderFieldsFragment } from "@/graphql/fragments/partial-folder-fields"
import { gql } from "@apollo/client"

export const userFoldersQuery = gql`
  ${partialFolderFieldsFragment}
  query UserFolders($user_id: ID!, $offset: Int!, $limit: Int!) {
    user(id: $user_id) {
      id
      folders(offset: $offset, limit: $limit) {
        ...PartialFolderFields
      }
    }
  }
`
