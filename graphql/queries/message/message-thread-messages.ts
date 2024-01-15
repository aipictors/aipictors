import { messageFieldsFragment } from "@/graphql/fragments/message-fields"
import { messageThreadFieldsFragment } from "@/graphql/fragments/message-thread-fields"
import { gql } from "@apollo/client"

export const messageThreadMessagesQuery = gql`
  ${messageThreadFieldsFragment}
  ${messageFieldsFragment}
  query MessageThreadMessages($threadId: ID!, $offset: Int!, $limit: Int!) {
    viewer {
      messageThread(threadId: $threadId) {
        id
        ...MessageThreadFields
        messages(offset: $offset, limit: $limit) {
          ...MessageFields
        }
      }
    }
  }
`
