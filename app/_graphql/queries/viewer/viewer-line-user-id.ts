import { gql } from "@/_graphql/__generated__"

/**
 * LINEユーザidの取得
 */
export const viewerLineUserIdQuery = gql(`
  query viewerLineUserId {
    viewer {
      lineUserId
    }
  }
`)
