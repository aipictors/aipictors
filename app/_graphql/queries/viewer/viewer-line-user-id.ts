import { graphql } from "gql.tada"

/**
 * LINEユーザidの取得
 */
export const viewerLineUserIdQuery = graphql(
  `query viewerLineUserId {
    viewer {
      lineUserId
    }
  }`,
)
