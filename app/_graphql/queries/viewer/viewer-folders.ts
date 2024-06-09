import { partialFolderFieldsFragment } from "@/_graphql/fragments/partial-folder-fields"
import { graphql } from "gql.tada"

/**
 * ログイン中のユーザのフォルダ
 */
export const viewerFoldersQuery = graphql(
  `query ViewerFolders($offset: Int!, $limit: Int!) {
    viewer {
      folders(offset: $offset, limit: $limit) {
        ...PartialFolderFields
      }
    }
  }`,
  [partialFolderFieldsFragment],
)
