import { messageThreadFieldsFragment } from "@/_graphql/fragments/message-thread-fields"
import { graphql } from "gql.tada"

export const messageThreadQuery = graphql(
  `query MessageThread($threadId: ID!) {
    viewer {
      messageThread(threadId: $threadId) {
        ...MessageThreadFields
      }
    }
  }`,
  [messageThreadFieldsFragment],
)
