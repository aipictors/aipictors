import { graphql } from "gql.tada"

/**
 * ログイン中のユーザの画像生成タスク
 */
export const viewerTokenQuery = graphql(
  `query ViewerToken {
    viewer {
      token
    }
  }`,
)
