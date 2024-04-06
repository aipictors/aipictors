import { gql } from "@/_graphql/__generated__"

export const messageThreadMessagesQuery = gql(`
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
`)
