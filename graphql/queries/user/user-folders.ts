import { gql } from "@/graphql/__generated__"
import { partialFolderFieldsFragment } from "@/graphql/fragments/partial-folder-fields"

export const userFoldersQuery = gql(`
  query UserFolders($user_id: ID!, $offset: Int!, $limit: Int!) {
    user(id: $user_id) {
      id
      folders(offset: $offset, limit: $limit) {
        ...PartialFolderFields
      }
    }
  }
`)
