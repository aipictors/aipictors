import { partialFolderFieldsFragment } from "@/_graphql/fragments/partial-folder-fields"
import { graphql } from "gql.tada"

export const userFoldersQuery = graphql(
  `query UserFolders($user_id: ID!, $offset: Int!, $limit: Int!) {
    user(id: $user_id) {
      id
      folders(offset: $offset, limit: $limit) {
        ...PartialFolderFields
      }
    }
  }`,
  [partialFolderFieldsFragment],
)
