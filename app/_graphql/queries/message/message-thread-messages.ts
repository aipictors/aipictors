import { messageFieldsFragment } from "@/_graphql/fragments/message-fields"
import { messageThreadFieldsFragment } from "@/_graphql/fragments/message-thread-fields"
import { graphql } from "gql.tada"

export const messageThreadMessagesQuery = graphql(
  `query MessageThreadMessages($threadId: ID!, $offset: Int!, $limit: Int!) {
    viewer {
      messageThread(threadId: $threadId) {
        id
        ...MessageThreadFields
        messages(offset: $offset, limit: $limit) {
          ...MessageFields
        }
      }
    }
  }`,
  [messageThreadFieldsFragment, messageFieldsFragment],
)
