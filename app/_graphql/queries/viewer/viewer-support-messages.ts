import { messageFieldsFragment } from "@/_graphql/fragments/message-fields"
import { graphql } from "gql.tada"

/**
 * ログイン中のユーザのシリーズのメッセージ
 */
export const viewerSupportMessagesQuery = graphql(
  `query ViewerSupportMessages($offset: Int!, $limit: Int!) {
    viewer {
      supportMessages(offset: $offset, limit: $limit) {
        ...MessageFields
      }
    }
  }`,
  [messageFieldsFragment],
)
