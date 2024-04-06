import { gql } from "@/_graphql/__generated__"

/**
 * ログイン中のユーザのシリーズのサポートメッセージ
 */
export const viewerSupportMessagesQuery = gql(`
  query ViewerSupportMessages($offset: Int!, $limit: Int!) {
    viewer {
      supportMessages(offset: $offset, limit: $limit) {
        ...MessageFields
      }
    }
  }
`)
