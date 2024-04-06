import { gql } from "@/_graphql/__generated__"

export const messageThreadQuery = gql(`
  query MessageThread($threadId: ID!) {
    viewer {
      messageThread(threadId: $threadId) {
        ...MessageThreadFields
      }
    }
  }
`)
