import { gql } from "@/_graphql/__generated__"

/**
 * ログイン中のユーザのフォルダ
 */
export const viewerFoldersQuery = gql(`
  query ViewerFolders($offset: Int!, $limit: Int!) {
    viewer {
      folders(offset: $offset, limit: $limit) {
        ...PartialFolderFields
      }
    }
  }
`)
