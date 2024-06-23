import { graphql } from "gql.tada"

/**
 * ログイン中のユーザのブックマークフォルダID
 */
export const viewerBookmarkFolderIdQuery = graphql(
  `query ViewerBookmarkFolderId {
    viewer {
      bookmarkFolderId
    }
  }`,
)
