import { messageThreadFieldsFragment } from "@/_graphql/fragments/message-thread-fields"
import { graphql } from "gql.tada"

/**
 * ログイン中のユーザのメッセージ
 */
export const viewerMessageThreadsQuery = graphql(
  `query ViewerMessageThreads($offset: Int!, $limit: Int!) {
    viewer {
      messageThreads(offset: $offset, limit: $limit) {
        ...MessageThreadFields
      }
    }
  }`,
  [messageThreadFieldsFragment],
)
