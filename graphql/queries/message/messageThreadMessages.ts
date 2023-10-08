import { gql } from "@apollo/client"

export const MESSAGE_THREAD_MESSAGES = gql`
  query MessageThreadMessages($threadId: ID!, $offset: Int!, $limit: Int!) {
    viewer {
      messageThread(threadId: $threadId) {
        id
        messages(offset: $offset, limit: $limit) {
          ...MessageFields
        }
      }
    }
  }
`
